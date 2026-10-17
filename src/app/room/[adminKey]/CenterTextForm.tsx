"use client";

import { useActionState, useEffect, useState } from "react";
import { CENTER_TEXT, LIMITS } from "@/lib/constants";
import { updateCenterText, type FormState } from "../../actions";

export function CenterTextForm({ adminKey, centerText }: { adminKey: string; centerText: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateCenterText.bind(null, adminKey),
    {},
  );
  const [value, setValue] = useState(centerText ?? CENTER_TEXT);
  const [saved, setSaved] = useState(false);

  // 保存が成功するたびに「保存しました」を少しだけ出す
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    setSaved(Boolean(state.ok));
    // 空で保存したら既定の言葉に戻ったことが分かるようにする
    if (state.ok && !value.trim()) setValue(CENTER_TEXT);
  }
  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(id);
  }, [saved, state]);

  const length = Array.from(value.replace(/\n/g, "")).length;

  return (
    <form action={action} className="card p-5 sm:p-6">
      <label htmlFor="center-text" className="section-title">
        色紙の真ん中の言葉
      </label>
      <textarea
        id="center-text"
        name="centerText"
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="field font-hand mt-4 resize-none text-center text-xl leading-relaxed"
      />
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>空にして保存すると「ありがとうございました」に戻ります</span>
        <span className={length > LIMITS.centerText ? "font-bold text-[#a2453d]" : undefined}>
          {length} / {LIMITS.centerText}
        </span>
      </div>
      {state.error && (
        <p role="alert" className="mt-2 text-sm font-bold text-[#a2453d]">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary mt-4 w-full py-2.5" aria-live="polite">
        {pending ? "保存しています…" : saved ? "保存しました" : "保存する"}
      </button>
    </form>
  );
}
