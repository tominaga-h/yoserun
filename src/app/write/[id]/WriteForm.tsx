"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { StampIcon } from "@/components/StampIcon";
import { INK_COLORS, LIMITS, STAMPS } from "@/lib/constants";
import { postMessage, type FormState } from "../../actions";

function Step({ n, label, htmlFor }: { n: number; label: string; htmlFor?: string }) {
  const Tag = htmlFor ? "label" : "p";
  return (
    <Tag htmlFor={htmlFor} className="mb-3 flex items-center gap-3 text-lg font-bold">
      <span className="grid size-8 place-items-center rounded-full bg-indigo text-base text-white">{n}</span>
      {label}
    </Tag>
  );
}

export function WriteForm({ roomId }: { roomId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(postMessage.bind(null, roomId), {});
  const [body, setBody] = useState("");
  const [color, setColor] = useState<string>(INK_COLORS[0].id);
  const [done, setDone] = useState(false);
  // 送信結果が新しく返ってきたときだけ完了画面に切り替える
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state.ok) setDone(true);
  }

  if (done) {
    return (
      <div>
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={120} height={120} className="mb-8" />
          <p className="text-2xl font-bold text-indigo sm:text-3xl">メッセージを送りました。</p>
          <p className="mt-4 text-xl font-bold">ありがとうございました</p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Link href={`/view/${roomId}?mode=shikishi`} className="btn btn-primary w-full py-4 text-lg">
            色紙を見る
          </Link>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setBody("");
              setColor(INK_COLORS[0].id);
            }}
            className="btn btn-outline w-full py-4 text-lg"
          >
            もう一度書く
          </button>
        </div>
      </div>
    );
  }

  const ink = INK_COLORS.find((c) => c.id === color)?.value;

  return (
    <form action={action}>
      <div className="card flex flex-col gap-7 p-5 sm:p-7">
        <div>
          <Step n={1} label="お名前" htmlFor="author" />
          <input
            id="author"
            name="author"
            required
            maxLength={LIMITS.authorName}
            placeholder="例：ゆうこ"
            autoComplete="nickname"
            className="field"
          />
        </div>

        <div>
          <Step n={2} label="メッセージ" htmlFor="body" />
          <textarea
            id="body"
            name="body"
            required
            rows={5}
            maxLength={LIMITS.message}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="ここに気持ちを書いてね"
            className="field font-hand resize-none text-lg leading-relaxed"
            style={{ color: ink }}
          />
          <p className="mt-1 text-right text-xs text-muted">
            {body.length} / {LIMITS.message}
          </p>
        </div>

        <fieldset>
          <legend className="contents">
            <Step n={3} label="文字の色を選んでね" />
          </legend>
          <div className="grid grid-cols-6 gap-2.5 sm:gap-4">
            {INK_COLORS.map((c, i) => (
              <label key={c.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c.id}
                  defaultChecked={i === 0}
                  onChange={() => setColor(c.id)}
                  className="peer sr-only"
                />
                <span
                  className="block aspect-square w-full rounded-full ring-offset-2 ring-offset-card transition peer-checked:ring-[3px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-indigo"
                  style={{ background: c.value, ["--tw-ring-color" as string]: c.value }}
                  title={c.label}
                />
                <span className="sr-only">{c.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="contents">
            <Step n={4} label="ひとことスタンプ" />
          </legend>
          <div className="grid grid-cols-5 gap-2.5">
            {STAMPS.map((s, i) => (
              <label key={s.id} className="cursor-pointer">
                <input type="radio" name="stamp" value={s.id} defaultChecked={i === 0} className="peer sr-only" />
                <span className="grid aspect-square place-items-center rounded-2xl border-[1.5px] border-line bg-field transition peer-checked:border-indigo peer-checked:bg-[#e9edf4] peer-focus-visible:outline-2 peer-focus-visible:outline-indigo">
                  <StampIcon stamp={s.id} color={ink} className="size-9" />
                </span>
                <span className="sr-only">{s.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {state.error && (
        <p role="alert" className="mt-4 text-center text-sm font-bold text-[#a2453d]">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full py-4 text-xl">
        {pending ? "送信しています…" : "送信する"}
      </button>
    </form>
  );
}
