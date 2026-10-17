function flowerPath() {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const cx = 12 + Math.cos(a) * 5.2;
    const cy = 12 + Math.sin(a) * 5.2;
    const r = 4.3;
    return `M${cx + r} ${cy}a${r} ${r} 0 1 0 ${-2 * r} 0a${r} ${r} 0 1 0 ${2 * r} 0z`;
  });
  return petals.join("");
}

/** 24x24 の viewBox 前提のパス。SVG 表示と Canvas(Path2D) の両方で使う */
export const STAMP_PATHS: Record<string, string> = {
  flower: flowerPath(),
  star: "M12 2.8l2.75 5.9 6.45.75-4.8 4.4 1.3 6.4L12 17.05 6.3 20.25l1.3-6.4-4.8-4.4 6.45-.75z",
  moon: "M19.6 15.1A8.3 8.3 0 0 1 8.9 4.4a8.3 8.3 0 1 0 10.7 10.7z",
  leaf: "M19.8 4.2C11 4.4 4.8 8.6 4.8 15.6c0 1.3.3 2.6.8 3.7.9-3.4 3.4-6.6 7.2-8.7-3.1 2.6-5.1 5.6-6 9 1 .4 2.2.6 3.4.6 6.2 0 9.4-5.4 9.6-16z",
  sparkle:
    "M10 2.5c.6 4 2.5 5.9 6.5 6.5-4 .6-5.9 2.5-6.5 6.5-.6-4-2.5-5.9-6.5-6.5 4-.6 5.9-2.5 6.5-6.5zM18 13.5c.35 2 1.3 2.95 3.3 3.3-2 .35-2.95 1.3-3.3 3.3-.35-2-1.3-2.95-3.3-3.3 2-.35 2.95-1.3 3.3-3.3z",
};

export function StampIcon({
  stamp,
  color = "currentColor",
  className,
}: {
  stamp: string;
  color?: string;
  className?: string;
}) {
  const d = STAMP_PATHS[stamp];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={d} fill={color} />
    </svg>
  );
}
