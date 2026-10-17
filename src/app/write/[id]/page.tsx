import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { RoomTitle } from "@/components/RoomTitle";
import { store } from "@/lib/store";
import { WriteForm } from "./WriteForm";

export const metadata: Metadata = {
  title: "メッセージを書く",
  robots: { index: false },
};

export default function WritePage({ params }: PageProps<"/write/[id]">) {
  return (
    <>
      <Header nav={false} />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-6">
        <Suspense fallback={<p className="text-muted">読み込み中…</p>}>
          <Write params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Write({ params }: { params: PageProps<"/write/[id]">["params"] }) {
  const { id } = await params;
  const room = await store.getRoom(id);
  if (!room) notFound();

  return (
    <>
      <p className="inline-block rounded-full bg-indigo px-4 py-1.5 text-sm font-bold text-white">
        メッセージを書いてね
      </p>
      <h1 className="mt-4 mb-6 text-4xl leading-tight font-bold break-keep [overflow-wrap:anywhere]">
        <RoomTitle name={room.name} stacked />
      </h1>
      <WriteForm roomId={room.id} />
    </>
  );
}
