import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 py-20 text-center">
        <h1 className="font-mincho text-2xl font-bold text-indigo-deep">お部屋が見つかりませんでした</h1>
        <p className="mt-4 text-muted">URLが正しいか、もう一度確かめてみてください。</p>
        <Link href="/" className="btn btn-primary mt-8">
          トップへ戻る
        </Link>
      </main>
    </>
  );
}
