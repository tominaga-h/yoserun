import Link from "next/link";

export function Header({ nav = true }: { nav?: boolean }) {
  return (
    <header className="border-b border-line/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={34} height={34} />
          <span className="font-mincho text-2xl font-bold tracking-wide text-indigo-deep">寄せるん</span>
        </Link>
        {nav && (
          <nav className="flex gap-5 text-sm font-medium text-ink sm:gap-8">
            <Link href="/#how" className="hover:text-indigo">
              使い方
            </Link>
            <Link href="/sample" className="hover:text-indigo">
              見本を見る
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
