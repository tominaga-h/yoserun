"use client";

import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";

export function UrlCard({
  title,
  subtitle,
  url,
  fileName,
}: {
  title: string;
  subtitle: string;
  url: string;
  fileName: string;
}) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // http（LAN の IP など）では Clipboard API が使えないので古い方法で
      const input = document.createElement("textarea");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function downloadQr() {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${fileName}.png`;
    a.click();
  }

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="section-title">{title}</h2>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
      <input
        readOnly
        value={url}
        aria-label={title}
        onFocus={(e) => e.currentTarget.select()}
        className="field mt-3 truncate py-2.5 text-sm"
      />
      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="shrink-0 rounded-xl bg-white p-2.5 shadow-sm"
          aria-label="QRコードを大きく表示"
        >
          <QRCodeSVG value={url} size={88} marginSize={0} fgColor="#1f1a16" />
        </button>
        <div className="flex flex-1 flex-col gap-2.5">
          <button type="button" onClick={copy} className="btn btn-primary w-full px-3 py-2.5 whitespace-nowrap" aria-live="polite">
            {copied ? "コピーしました" : "コピー"}
          </button>
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="btn btn-outline w-full px-3 py-2.5 whitespace-nowrap"
          >
            QRコード
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        className="m-auto w-[min(92vw,380px)] rounded-2xl bg-card p-0 text-ink"
      >
        <div className="flex flex-col items-center gap-4 p-6">
          <h3 className="font-bold">{title}</h3>
          <div className="rounded-xl bg-white p-4">
            <QRCodeCanvas ref={qrCanvasRef} value={url} size={260} marginSize={2} fgColor="#1f1a16" />
          </div>
          <p className="w-full text-center text-xs break-all text-muted">{url}</p>
          <div className="flex w-full gap-2.5">
            <button type="button" onClick={downloadQr} className="btn btn-primary flex-1 py-2.5">
              画像で保存
            </button>
            <button type="button" onClick={() => dialogRef.current?.close()} className="btn btn-outline flex-1 py-2.5">
              閉じる
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
