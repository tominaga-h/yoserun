export const INK_COLORS = [
  { id: "indigo", label: "藍", value: "#2E4A7D" },
  { id: "green", label: "緑", value: "#3F6B52" },
  { id: "brown", label: "茶", value: "#86654A" },
  { id: "plum", label: "紅", value: "#9A5470" },
  { id: "slate", label: "青灰", value: "#5F7699" },
  { id: "mustard", label: "山吹", value: "#B98A35" },
] as const;

export const STAMPS = [
  { id: "flower", label: "花" },
  { id: "star", label: "星" },
  { id: "moon", label: "月" },
  { id: "leaf", label: "葉" },
  { id: "sparkle", label: "きらきら" },
] as const;

export type InkColorId = (typeof INK_COLORS)[number]["id"];
export type StampId = (typeof STAMPS)[number]["id"];

/** 色紙1枚に気持ちよく収まる目安の人数（ダッシュボードの進み具合に使う） */
export const SHIKISHI_CAPACITY = 20;

export const LIMITS = {
  roomName: 40,
  authorName: 20,
  message: 140,
} as const;

export const CENTER_TEXT = "ありがとう\nございました";

export function inkColor(id: string): string {
  return INK_COLORS.find((c) => c.id === id)?.value ?? INK_COLORS[0].value;
}
