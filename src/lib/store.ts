import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import postgres from "postgres";

export type Room = {
  id: string;
  adminKey: string;
  name: string;
  createdAt: string;
};

export type Message = {
  id: string;
  roomId: string;
  author: string;
  body: string;
  color: string;
  stamp: string;
  createdAt: string;
};

export type NewMessage = Omit<Message, "createdAt">;

export type RoomSummary = Room & { messageCount: number; lastMessageAt: string | null };

interface Store {
  createRoom(room: Omit<Room, "createdAt">): Promise<Room>;
  getRoom(id: string): Promise<Room | null>;
  getRoomByAdminKey(adminKey: string): Promise<Room | null>;
  addMessage(message: NewMessage): Promise<Message>;
  /** 新しい順 */
  listMessages(roomId: string): Promise<Message[]>;
  /** 運営者用。作成が新しい順 */
  listRooms(): Promise<RoomSummary[]>;
}

// ---------------------------------------------------------------------------
// Postgres（DATABASE_URL があるとき。Supabase の接続文字列をそのまま使う）
// ---------------------------------------------------------------------------

function createPostgresStore(url: string): Store {
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  const sql = postgres(url, {
    max: 3,
    idle_timeout: 20,
    // Supabase の Transaction pooler（6543番ポート）は prepared statement を使えない
    prepare: false,
    ssl: local ? false : "require",
  });

  // RLS を有効にしてポリシーは作らない。
  // Supabase の公開 API（anon キー）からは読み書きできず、サーバーからの接続（テーブルの所有者）だけが触れる
  let ready: Promise<unknown> | null = null;
  const migrate = () =>
    (ready ??= sql`
      create table if not exists rooms (
        id text primary key,
        admin_key text not null unique,
        name text not null,
        created_at timestamptz not null default now()
      );
      create table if not exists messages (
        id text primary key,
        room_id text not null references rooms(id) on delete cascade,
        author text not null,
        body text not null,
        color text not null,
        stamp text not null,
        created_at timestamptz not null default now()
      );
      create index if not exists messages_room_idx on messages (room_id, created_at desc);
      alter table rooms enable row level security;
      alter table messages enable row level security;
    `
      .simple()
      .catch((error) => {
        ready = null; // 一時的な接続エラーなら次のリクエストでやり直す
        throw error;
      }));

  type RoomRow = { id: string; admin_key: string; name: string; created_at: Date };
  type MessageRow = {
    id: string;
    room_id: string;
    author: string;
    body: string;
    color: string;
    stamp: string;
    created_at: Date;
  };

  const toRoom = (r: RoomRow): Room => ({
    id: r.id,
    adminKey: r.admin_key,
    name: r.name,
    createdAt: r.created_at.toISOString(),
  });
  const toMessage = (m: MessageRow): Message => ({
    id: m.id,
    roomId: m.room_id,
    author: m.author,
    body: m.body,
    color: m.color,
    stamp: m.stamp,
    createdAt: m.created_at.toISOString(),
  });

  return {
    async createRoom(room) {
      await migrate();
      const [row] = await sql<RoomRow[]>`
        insert into rooms (id, admin_key, name)
        values (${room.id}, ${room.adminKey}, ${room.name})
        returning *`;
      return toRoom(row);
    },
    async getRoom(id) {
      await migrate();
      const [row] = await sql<RoomRow[]>`select * from rooms where id = ${id}`;
      return row ? toRoom(row) : null;
    },
    async getRoomByAdminKey(adminKey) {
      await migrate();
      const [row] = await sql<RoomRow[]>`select * from rooms where admin_key = ${adminKey}`;
      return row ? toRoom(row) : null;
    },
    async addMessage(m) {
      await migrate();
      const [row] = await sql<MessageRow[]>`
        insert into messages (id, room_id, author, body, color, stamp)
        values (${m.id}, ${m.roomId}, ${m.author}, ${m.body}, ${m.color}, ${m.stamp})
        returning *`;
      return toMessage(row);
    },
    async listMessages(roomId) {
      await migrate();
      const rows = await sql<MessageRow[]>`
        select * from messages where room_id = ${roomId} order by created_at desc`;
      return rows.map(toMessage);
    },
    async listRooms() {
      await migrate();
      const rows = await sql<(RoomRow & { message_count: number; last_message_at: Date | null })[]>`
        select r.*, count(m.id)::int as message_count, max(m.created_at) as last_message_at
        from rooms r left join messages m on m.room_id = r.id
        group by r.id
        order by r.created_at desc`;
      return rows.map((r) => ({
        ...toRoom(r),
        messageCount: r.message_count,
        lastMessageAt: r.last_message_at?.toISOString() ?? null,
      }));
    },
  };
}

// ---------------------------------------------------------------------------
// JSON ファイル（ローカル開発用。DATABASE_URL がないとき）
// ---------------------------------------------------------------------------

function createFileStore(file: string): Store {
  type Data = { rooms: Room[]; messages: Message[] };

  async function read(): Promise<Data> {
    try {
      return JSON.parse(await fs.readFile(file, "utf8")) as Data;
    } catch {
      return { rooms: [], messages: [] };
    }
  }

  // 書き込みを直列化して、同時投稿でファイルが壊れないようにする
  let queue: Promise<unknown> = Promise.resolve();
  function update<T>(fn: (data: Data) => T): Promise<T> {
    const run = queue.then(async () => {
      const data = await read();
      const result = fn(data);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(data, null, 2));
      return result;
    });
    queue = run.catch(() => {});
    return run;
  }

  const now = () => new Date().toISOString();

  return {
    createRoom: (room) =>
      update((data) => {
        const created = { ...room, createdAt: now() };
        data.rooms.push(created);
        return created;
      }),
    getRoom: async (id) => (await read()).rooms.find((r) => r.id === id) ?? null,
    getRoomByAdminKey: async (adminKey) =>
      (await read()).rooms.find((r) => r.adminKey === adminKey) ?? null,
    addMessage: (m) =>
      update((data) => {
        const created = { ...m, createdAt: now() };
        data.messages.push(created);
        return created;
      }),
    listMessages: async (roomId) =>
      (await read()).messages
        .filter((m) => m.roomId === roomId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    listRooms: async () => {
      const { rooms, messages } = await read();
      return rooms
        .map((room) => {
          const own = messages.filter((m) => m.roomId === room.id);
          const last = own.reduce<string | null>((acc, m) => (!acc || m.createdAt > acc ? m.createdAt : acc), null);
          return { ...room, messageCount: own.length, lastMessageAt: last };
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  };
}

const globalForStore = globalThis as unknown as { yoserunStore?: Store };

export const store: Store = (globalForStore.yoserunStore ??= process.env.DATABASE_URL
  ? createPostgresStore(process.env.DATABASE_URL)
  : createFileStore(path.join(process.cwd(), ".data", "yoserun.json")));
