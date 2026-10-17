import "server-only";
import { headers } from "next/headers";

/** リクエストのホストから、共有用の絶対URLの起点を組み立てる */
export async function siteOrigin(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (/^(localhost|127\.|\d+\.\d+\.\d+\.\d+)/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}
