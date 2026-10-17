import type { Metadata } from "next";
import { Klee_One, Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const mincho = Shippori_Mincho({
  variable: "--font-mincho",
  weight: ["500", "700", "800"],
  subsets: ["latin"],
  preload: false,
});

const gothic = Zen_Kaku_Gothic_New({
  variable: "--font-gothic",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: false,
});

const hand = Klee_One({
  variable: "--font-hand",
  weight: ["400", "600"],
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "寄せるん — オンライン寄せ書き", template: "%s | 寄せるん" },
  description:
    "お部屋の名前を決めるだけ。URLを送れば、みんながスマホからメッセージを書いて、ひとつの寄せ書きになります。",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${mincho.variable} ${gothic.variable} ${hand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
