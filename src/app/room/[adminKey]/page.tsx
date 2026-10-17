import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Header } from "@/components/Header";
import { RoomTitle } from "@/components/RoomTitle";
import { Shikishi } from "@/components/Shikishi";
import { UrlCard } from "@/components/UrlCard";
import { SHIKISHI_CAPACITY, inkColor } from "@/lib/constants";
import { store } from "@/lib/store";
import { siteOrigin } from "@/lib/url";
import { CenterTextForm } from "./CenterTextForm";

export const metadata: Metadata = {
  title: "お部屋のダッシュボード",
  robots: { index: false },
};

export default function RoomPage({ params }: PageProps<"/room/[adminKey]">) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 md:py-10">
        <Suspense fallback={<p className="text-muted">読み込み中…</p>}>
          <Dashboard params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Dashboard({ params }: { params: PageProps<"/room/[adminKey]">["params"] }) {
  const { adminKey } = await params;
  const room = await store.getRoomByAdminKey(adminKey);
  if (!room) notFound();

  const [messages, origin] = await Promise.all([store.listMessages(room.id), siteOrigin()]);
  const writeUrl = `${origin}/write/${room.id}`;
  const viewUrl = `${origin}/view/${room.id}`;
  const count = messages.length;
  const progress = Math.min(1, count / SHIKISHI_CAPACITY);
  const remaining = SHIKISHI_CAPACITY - count;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <AutoRefresh />

      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mincho font-bold text-indigo">お部屋</p>
            <h1 className="font-mincho text-[2.5rem] leading-tight font-extrabold break-keep [overflow-wrap:anywhere] sm:text-5xl">
              <RoomTitle name={room.name} />
            </h1>
          </div>
          <div className="shrink-0 rounded-2xl bg-[#efe8dc] px-5 py-3 text-center">
            <p className="font-mincho text-indigo-deep">
              <span className="text-4xl font-bold">{count}</span>
              <span className="text-lg font-bold">人</span>
            </p>
            <p className="text-xs text-ink">書いてくれた人</p>
          </div>
        </div>

        <p className="rounded-xl border border-dashed border-line px-4 py-3 text-sm leading-relaxed text-muted">
          このページはお部屋の管理用です。あとで見返せるよう、このページのURLをブックマークしておいてください。
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <UrlCard title="書くためのURL" subtitle="入力フォーム" url={writeUrl} fileName={`${room.name}_書くためのQR`} />
          <UrlCard
            title="みんなの寄せ書きを見るURL"
            subtitle="閲覧"
            url={viewUrl}
            fileName={`${room.name}_見るためのQR`}
          />
        </div>

        <section className="card p-5 sm:p-6">
          <h2 className="section-title">最新のメッセージ</h2>
          {count === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              まだメッセージはありません。「書くためのURL」をみんなに送ってみましょう。
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {messages.slice(0, 4).map((m) => (
                <li
                  key={m.id}
                  className="rounded-xl p-4 shadow-sm"
                  style={{ background: `color-mix(in srgb, ${inkColor(m.color)} 9%, #fcfaf5)` }}
                >
                  <p className="font-bold" style={{ color: inkColor(m.color) }}>
                    {m.author}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed whitespace-pre-line">{m.body}</p>
                </li>
              ))}
            </ul>
          )}
          {count > 4 && (
            <Link href={`/view/${room.id}`} className="mt-4 inline-block text-sm font-bold text-indigo hover:underline">
              すべて見る（{count}件）→
            </Link>
          )}
        </section>
      </div>

      <div className="flex flex-col gap-5">
        <Link href={`/view/${room.id}?mode=shikishi`} className="block transition-transform hover:-translate-y-0.5">
          <Shikishi messages={messages} orientation="landscape" centerText={room.centerText ?? undefined} />
        </Link>

        <CenterTextForm adminKey={room.adminKey} centerText={room.centerText} />

        <section className="card p-5 sm:p-6">
          <h2 className="section-title">色紙の進み具合</h2>
          <div className="mt-4 flex items-center gap-4">
            <div
              className="h-5 flex-1 overflow-hidden rounded-full bg-[#ece5d9]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={SHIKISHI_CAPACITY}
              aria-valuenow={count}
            >
              <div className="h-full rounded-full bg-indigo transition-[width]" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="font-mincho shrink-0 text-indigo-deep">
              <span className="text-3xl font-bold">{count}</span>
              <span className="text-ink"> / {SHIKISHI_CAPACITY} 枚</span>
            </p>
          </div>
          <p className="mt-3 text-sm text-muted">
            {remaining > 0
              ? `あと${remaining}人で色紙がいっぱいになります`
              : "色紙がいっぱいになりました！さらに書くと文字が小さくなります"}
          </p>
        </section>
      </div>
    </div>
  );
}
