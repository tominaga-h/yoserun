"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { CENTER_TEXT, inkColor } from "@/lib/constants";
import { STAMP_PATHS } from "./StampIcon";

export type ShikishiMessage = {
  id: string;
  author: string;
  body: string;
  color: string;
  stamp: string;
};

type Orientation = "landscape" | "portrait";

const CENTER_INK = "#2a2420";
const LINE_HEIGHT = 1.45;
/** 行頭に来てはいけない文字（ぶら下げる） */
const NO_LINE_START = "、。，．,.）)」』】〕！？!?ー〜ぁぃぅぇぉっゃゅょァィゥェォッャュョ";

// ---------------------------------------------------------------------------
// レイアウト（純粋関数）
// ---------------------------------------------------------------------------

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Grid = { cols: number; rows: number; center: { c0: number; c1: number; r0: number; r1: number } };

function centerBlock(cols: number, rows: number) {
  const r0 = rows % 2 ? (rows - 1) / 2 : rows / 2 - 1;
  const r1 = rows % 2 ? r0 : r0 + 1;
  // 3列のときは中央の行をまるごと使う（「ありがとう」が窮屈にならないように）
  return cols >= 4 ? { c0: 1, c1: cols - 2, r0, r1 } : { c0: 0, c1: cols - 1, r0, r1 };
}

/** メッセージ数が収まる、いちばんセルが大きいグリッドを選ぶ */
function chooseGrid(count: number, areaW: number, areaH: number): Grid {
  let best: (Grid & { score: number }) | null = null;
  for (let cols = 3; cols <= 12; cols++) {
    for (let rows = 3; rows <= 12; rows++) {
      const aspect = areaW / cols / (areaH / rows);
      if (aspect < 0.9 || aspect > 2.2) continue;
      const center = centerBlock(cols, rows);
      const slots = cols * rows - (center.c1 - center.c0 + 1) * (center.r1 - center.r0 + 1);
      if (slots < count) continue;
      const score = cols * rows + Math.abs(aspect - 1.4) * 0.5;
      if (!best || score < best.score) best = { cols, rows, center, score };
    }
  }
  return best ?? { cols: 12, rows: 12, center: centerBlock(12, 12) };
}

/** 空きセルを中心からの角度順（12時から時計回り）に並べ、均等に間引いて選ぶ */
function pickSlots(grid: Grid, count: number) {
  const { cols, rows, center } = grid;
  const slots: { c: number; r: number; angle: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c >= center.c0 && c <= center.c1 && r >= center.r0 && r <= center.r1) continue;
      const dx = c + 0.5 - cols / 2;
      const dy = r + 0.5 - rows / 2;
      const angle = (Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 4) % (Math.PI * 2);
      slots.push({ c, r, angle });
    }
  }
  slots.sort((a, b) => a.angle - b.angle);
  return Array.from({ length: count }, (_, i) => slots[Math.floor((i * slots.length) / count)]);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const ch of Array.from(paragraph)) {
      if (line && ctx.measureText(line + ch).width > maxWidth && !NO_LINE_START.includes(ch)) {
        lines.push(line);
        line = ch;
      } else {
        line += ch;
      }
    }
    lines.push(line);
  }
  return lines;
}

// ---------------------------------------------------------------------------
// 描画
// ---------------------------------------------------------------------------

function drawBoard(ctx: CanvasRenderingContext2D, W: number, H: number, frame: number) {
  const gold = ctx.createLinearGradient(0, 0, W, H);
  gold.addColorStop(0, "#c9a96a");
  gold.addColorStop(0.5, "#e2c891");
  gold.addColorStop(1, "#b48f52");
  ctx.fillStyle = gold;
  ctx.fillRect(0, 0, W, H);

  const paper = ctx.createRadialGradient(W * 0.4, H * 0.35, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
  paper.addColorStop(0, "#fdfbf5");
  paper.addColorStop(1, "#f1e9d8");
  ctx.fillStyle = paper;
  ctx.fillRect(frame, frame, W - frame * 2, H - frame * 2);

  // 和紙の繊維っぽい細かい点
  const rand = rng(7);
  for (let i = 0; i < (W * H) / 900; i++) {
    ctx.fillStyle = `rgba(140, 118, 84, ${0.04 + rand() * 0.07})`;
    const x = frame + rand() * (W - frame * 2);
    const y = frame + rand() * (H - frame * 2);
    ctx.fillRect(x, y, 1 + rand() * 2.5, 1 + rand() * 1.2);
  }

  // 額縁の内側の影
  ctx.strokeStyle = "rgba(90, 64, 30, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(frame + 1, frame + 1, W - frame * 2 - 2, H - frame * 2 - 2);
}

function fitCenterText(
  ctx: CanvasRenderingContext2D,
  family: string,
  text: string,
  w: number,
  h: number,
  max: number,
) {
  // 書いたとおりの改行を優先し、長い1行は枠の幅で折り返す
  let lines = text.split("\n");
  for (let size = max; size > 12; size -= 2) {
    ctx.font = `600 ${size}px ${family}`;
    lines = wrap(ctx, text, w);
    if (lines.length * size * 1.3 <= h) return { size, lines };
  }
  return { size: 12, lines };
}

function drawShikishi(
  canvas: HTMLCanvasElement,
  messages: ShikishiMessage[],
  orientation: Orientation,
  family: string,
  centerText: string,
) {
  const W = orientation === "landscape" ? 1600 : 1200;
  const H = orientation === "landscape" ? 1200 : 1600;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const frame = 26;
  drawBoard(ctx, W, H, frame);

  const pad = 56;
  const ax = frame + pad;
  const ay = frame + pad;
  const aw = W - (frame + pad) * 2;
  const ah = H - (frame + pad) * 2;

  const grid = chooseGrid(messages.length, aw, ah);
  const cw = aw / grid.cols;
  const ch = ah / grid.rows;

  // 真ん中の「ありがとうございました」
  const { c0, c1, r0, r1 } = grid.center;
  const bw = (c1 - c0 + 1) * cw;
  const bh = (r1 - r0 + 1) * ch;
  const center = fitCenterText(ctx, family, centerText, bw * 0.8, bh * 0.85, 112);
  ctx.font = `600 ${center.size}px ${family}`;
  ctx.fillStyle = CENTER_INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const ccx = ax + (c0 + c1 + 1) * cw * 0.5;
  const ccy = ay + (r0 + r1 + 1) * ch * 0.5;
  center.lines.forEach((line, i) => {
    ctx.fillText(line, ccx, ccy + (i - (center.lines.length - 1) / 2) * center.size * 1.3);
  });

  // 寄せ書き（古い順に、12時の位置から時計回り）
  const ordered = [...messages].reverse();
  const slots = pickSlots(grid, ordered.length);
  ordered.forEach((m, i) => {
    const slot = slots[i];
    const rand = rng(hash(m.id));
    const boxW = cw * 0.9;
    const boxH = ch * 0.86;

    const maxSize = Math.min(ch * 0.2, cw * 0.13, 56);
    const authored = m.body.split("\n").map((l) => Array.from(l).length);
    let size = maxSize;
    let lines: string[] = [];
    for (; size >= 12; size -= 1) {
      ctx.font = `600 ${size}px ${family}`;
      lines = wrap(ctx, m.body, boxW);
      const total = lines.length * size * LINE_HEIGHT + size * 0.85 * 1.5;
      // 「す」だけが次の行に落ちるような折り返しは、少し小さくして避ける
      const orphan =
        lines.length > authored.length &&
        lines.some((l) => Array.from(l).length <= 2) &&
        !authored.some((n) => n <= 2);
      if (total <= boxH && (!orphan || size < maxSize * 0.85)) break;
    }
    ctx.font = `600 ${size}px ${family}`;
    const blockW = Math.min(boxW, Math.max(...lines.map((l) => ctx.measureText(l).width)));
    const nameSize = size * 0.82;
    const blockH = lines.length * size * LINE_HEIGHT + nameSize * 1.5;

    const cx = ax + (slot.c + 0.5) * cw + (rand() - 0.5) * (cw - blockW) * 0.5;
    const cy = ay + (slot.r + 0.5) * ch + (rand() - 0.5) * (ch - blockH) * 0.5;
    const angle = ((rand() - 0.5) * 8 * Math.PI) / 180;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const color = inkColor(m.color);
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const left = -blockW / 2;
    let y = -blockH / 2;
    for (const line of lines) {
      ctx.fillText(line, left, y);
      y += size * LINE_HEIGHT;
    }

    // 名前（右寄せ）とスタンプ
    y += nameSize * 0.3;
    ctx.font = `400 ${nameSize}px ${family}`;
    ctx.textAlign = "right";
    const right = blockW / 2;
    ctx.fillText(m.author, right, y);
    const nameW = ctx.measureText(m.author).width;
    const path = STAMP_PATHS[m.stamp];
    if (path) {
      const s = nameSize * 1.05;
      ctx.save();
      ctx.translate(right - nameW - s - nameSize * 0.35, y - s * 0.05);
      ctx.scale(s / 24, s / 24);
      ctx.globalAlpha = 0.85;
      ctx.fill(new Path2D(path));
      ctx.restore();
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------------------
// コンポーネント
// ---------------------------------------------------------------------------

function useAutoOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setOrientation(mq.matches ? "landscape" : "portrait");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return orientation;
}

export function Shikishi({
  messages,
  orientation = "auto",
  centerText = CENTER_TEXT,
  ref,
  className,
}: {
  messages: ShikishiMessage[];
  orientation?: Orientation | "auto";
  centerText?: string;
  ref?: Ref<HTMLCanvasElement>;
  className?: string;
}) {
  const auto = useAutoOrientation();
  const resolved = orientation === "auto" ? auto : orientation;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const family = getComputedStyle(canvas).getPropertyValue("--font-hand").trim() || "sans-serif";
    const allText = centerText + messages.map((m) => m.body + m.author).join("");
    // Webフォントは使う文字のサブセットが読み込まれてから描く。
    // 回線が遅いときは待ちすぎないよう先に代替フォントで描き、届いたら描き直す
    const fontsReady = Promise.all([
      document.fonts.load(`600 40px ${family}`, allText),
      document.fonts.load(`400 40px ${family}`, allText),
    ]).catch(() => {});
    const draw = () => {
      if (cancelled) return;
      drawShikishi(canvas, messages, resolved, family, centerText);
      setReady(true);
    };
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 2500))]).then(draw);
    fontsReady.then(draw);
    return () => {
      cancelled = true;
    };
  }, [messages, resolved, centerText]);

  return (
    <canvas
      ref={(node) => {
        canvasRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      role="img"
      aria-label={`寄せ書きの色紙（${messages.length}件のメッセージ）`}
      className={`block h-auto w-full rounded-[6px] shadow-[0_18px_40px_-18px_rgba(58,42,32,0.55),0_2px_6px_rgba(58,42,32,0.15)] transition-opacity duration-300 ${
        ready ? "opacity-100" : "animate-pulse bg-[#eadfc8] opacity-60"
      } ${className ?? ""}`}
      style={{ aspectRatio: resolved === "landscape" ? "4 / 3" : "3 / 4" }}
    />
  );
}
