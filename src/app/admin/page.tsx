import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "運営者用：部屋の一覧",
  robots: { index: false },
};

const dateFormat = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function AdminPage() {
  return (
    <>
      <Header nav={false} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 md:py-10">
        <h1 className="font-mincho text-3xl font-bold text-indigo-deep">部屋の一覧</h1>
        <p className="mt-1 text-sm text-muted">運営者用のページです。ここに出るリンクは他の人に共有しないでください。</p>
        <Suspense fallback={<p className="mt-6 text-muted">読み込み中…</p>}>
          <Rooms />
        </Suspense>
      </main>
    </>
  );
}

async function Rooms() {
  // proxy でも確認しているが、念のためページ側でも確かめる
  if (!isAdminAuthorized((await headers()).get("authorization"))) notFound();

  const rooms = await store.listRooms();
  const totalMessages = rooms.reduce((sum, r) => sum + r.messageCount, 0);

  return (
    <>
      <dl className="mt-6 grid max-w-md grid-cols-2 gap-3">
        {[
          ["部屋", rooms.length],
          ["メッセージ", totalMessages],
        ].map(([label, value]) => (
          <div key={label} className="card px-5 py-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="font-mincho text-3xl font-bold text-indigo-deep">{value}</dd>
          </div>
        ))}
      </dl>

      {rooms.length === 0 ? (
        <p className="card mt-6 p-8 text-center text-muted">まだ部屋はありません。</p>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">部屋の名前</th>
                <th className="px-5 py-3 font-medium">作成</th>
                <th className="px-5 py-3 text-right font-medium">メッセージ</th>
                <th className="px-5 py-3 font-medium">最後の投稿</th>
                <th className="px-5 py-3 font-medium">リンク</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b border-line/60 last:border-0">
                  <td className="px-5 py-3 font-bold">{room.name}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-muted">
                    {dateFormat.format(new Date(room.createdAt))}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{room.messageCount}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-muted">
                    {room.lastMessageAt ? dateFormat.format(new Date(room.lastMessageAt)) : "—"}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="flex gap-3 font-bold text-indigo">
                      <Link href={`/room/${room.adminKey}`} className="hover:underline">
                        管理
                      </Link>
                      <Link href={`/view/${room.id}`} className="hover:underline">
                        見る
                      </Link>
                      <Link href={`/write/${room.id}`} className="hover:underline">
                        書く
                      </Link>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
