"use client";

import { useRef, useState } from "react";
import { inkColor } from "@/lib/constants";
import { RoomTitle } from "./RoomTitle";
import { Shikishi, type ShikishiMessage } from "./Shikishi";
import { StampIcon } from "./StampIcon";

type Mode = "list" | "shikishi";

export function Viewer({
  roomName,
  messages,
  centerText,
  initialMode = "list",
  emptyAction,
}: {
  roomName: string;
  messages: ShikishiMessage[];
  centerText?: string;
  initialMode?: Mode;
  emptyAction?: React.ReactNode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function save() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${roomName}_寄せ書き.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="min-w-0 text-3xl font-bold break-keep [overflow-wrap:anywhere] sm:text-4xl">
          <RoomTitle name={roomName} />
        </h1>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
          <div role="tablist" aria-label="表示の切り替え" className="flex rounded-full bg-card p-1 shadow-sm">
            {(
              [
                ["list", "一覧"],
                ["shikishi", "色紙"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => setMode(value)}
                className={`rounded-full px-5 py-2 font-bold whitespace-nowrap transition-colors sm:px-7 ${
                  mode === value ? "bg-indigo text-white" : "text-ink hover:text-indigo"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === "shikishi" && messages.length > 0 && (
            <button type="button" onClick={save} className="btn btn-outline px-4 py-2.5 whitespace-nowrap">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <path
                  d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              画像で保存
            </button>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-muted">まだメッセージはありません。</p>
          {emptyAction}
        </div>
      ) : mode === "list" ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {messages.map((m) => {
            const color = inkColor(m.color);
            return (
              <li
                key={m.id}
                className="flex min-h-48 flex-col justify-between rounded-2xl p-6 shadow-[0_6px_18px_-10px_rgba(58,42,32,0.35)]"
                style={{ background: `color-mix(in srgb, ${color} 8%, #fcfaf5)` }}
              >
                <p className="font-hand text-xl leading-relaxed font-semibold whitespace-pre-line" style={{ color }}>
                  {m.body}
                </p>
                <p className="mt-4 flex items-center justify-end gap-1.5 text-ink">
                  <StampIcon stamp={m.stamp} color={color} className="size-5" />
                  {m.author}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mx-auto mt-8 max-w-4xl">
          <Shikishi ref={canvasRef} messages={messages} centerText={centerText} />
        </div>
      )}
    </>
  );
}
