import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Viewer } from "@/components/Viewer";
import { SAMPLE_MESSAGES, SAMPLE_ROOM_NAME } from "@/lib/sample";

export const metadata: Metadata = { title: "見本" };

export default function SamplePage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 md:py-10">
        <p className="mb-4 inline-block rounded-full bg-[#efe8dc] px-3 py-1 text-xs font-bold text-muted">見本</p>
        <Viewer roomName={SAMPLE_ROOM_NAME} messages={SAMPLE_MESSAGES} initialMode="shikishi" />
      </main>
    </>
  );
}
