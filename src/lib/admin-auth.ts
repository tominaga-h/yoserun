import { createHash, timingSafeEqual } from "node:crypto";

/** ADMIN_PASSWORD が未設定なら運営者ページそのものを無効にする */
export function adminEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Basic 認証の Authorization ヘッダーを検証する（ユーザー名は見ない） */
export function isAdminAuthorized(authorization: string | null): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !authorization?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(authorization.slice("Basic ".length), "base64").toString("utf8");
  const password = decoded.slice(decoded.indexOf(":") + 1);

  // 長さの違いで比較時間が変わらないよう、ハッシュ同士を比べる
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(password), digest(expected));
}
