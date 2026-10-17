"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** 画面を開いている間、新しいメッセージを拾うために定期的にサーバーから取り直す */
export function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
