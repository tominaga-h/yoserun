import { Header } from "@/components/Header";
import { Shikishi } from "@/components/Shikishi";
import { SAMPLE_MESSAGES } from "@/lib/sample";
import { CreateRoomForm } from "./CreateRoomForm";

const STEPS = [
  {
    title: "部屋をつくる",
    body: "お部屋の名前を入れてボタンを押すだけ。登録やログインはいりません。",
  },
  {
    title: "URLを送る",
    body: "書くためのURLやQRコードを、チャットや会場でみんなに共有します。",
  },
  {
    title: "色紙で渡す",
    body: "集まったメッセージは一覧と色紙で見られます。色紙は画像で保存できます。",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <h1 className="font-mincho text-[2.1rem] leading-[1.35] font-bold text-indigo-deep sm:text-5xl sm:leading-[1.3]">
              <span className="text-[1.45em] font-extrabold">感謝</span>の気持ちを、
              <br />
              ひとつの<span className="text-[1.45em] font-extrabold">色紙</span>に。
            </h1>
            <p className="font-mincho mt-6 leading-loose text-ink">
              お部屋の名前を決めるだけ。URLを送れば、みんながスマホから
              メッセージを書いて、ひとつの寄せ書きになります。
            </p>
            <div className="mt-8 max-w-lg">
              <CreateRoomForm />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl pb-20">
            <div className="rotate-[1.2deg]">
              <Shikishi messages={SAMPLE_MESSAGES.slice(2)} orientation="landscape" />
            </div>
            <div className="font-hand absolute bottom-0 left-2 w-44 -rotate-3 rounded-md bg-[#dfe3ea] p-4 text-sm leading-relaxed text-indigo-deep shadow-lg sm:w-52">
              出会えてよかった
              <br />
              これからもがんばってください
              <span className="mt-1 block text-right">りょう</span>
            </div>
            <div className="font-hand absolute right-0 -bottom-3 w-44 rotate-2 rounded-md bg-[#efe2c6] p-4 text-sm leading-relaxed text-[#5b4330] shadow-lg sm:w-52">
              素敵な時間をありがとうございました
              <span className="mt-1 block text-right">みなみ</span>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-6 px-4 pb-20 sm:px-6">
          <h2 className="font-mincho mb-6 text-2xl font-bold text-indigo-deep">使い方</h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="card p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-indigo text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
