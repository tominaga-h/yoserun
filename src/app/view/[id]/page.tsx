import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Header } from "@/components/Header";
import { Viewer } from "@/components/Viewer";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "みんなの寄せ書き",
  robots: { index: false },
};

export default function ViewPage({ params, searchParams }: PageProps<"/view/[id]">) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 md:py-10">
        <Suspense fallback={<p className="text-muted">読み込み中…</p>}>
          <View params={params} searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function View({ params, searchParams }: Pick<PageProps<"/view/[id]">, "params" | "searchParams">) {
  const [{ id }, { mode }] = await Promise.all([params, searchParams]);
  const room = await store.getRoom(id);
  if (!room) notFound();
  const messages = await store.listMessages(room.id);

  return (
    <>
      <AutoRefresh intervalMs={30000} />
      <Viewer
        roomName={room.name}
        messages={messages}
        initialMode={mode === "shikishi" ? "shikishi" : "list"}
        emptyAction={
          <Link href={`/write/${room.id}`} className="btn btn-primary mt-5">
            最初のメッセージを書く
          </Link>
        }
      />
    </>
  );
}
