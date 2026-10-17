"use server";

import { customAlphabet } from "nanoid";
import { redirect } from "next/navigation";
import { INK_COLORS, LIMITS, STAMPS } from "@/lib/constants";
import { store } from "@/lib/store";

const alphabet = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const publicId = customAlphabet(alphabet, 10);
const adminKey = customAlphabet(alphabet, 24);
const messageId = customAlphabet(alphabet, 16);

export type FormState = { error?: string; ok?: boolean };

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function createRoom(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name");
  if (!name) return { error: "部屋の名前を入れてください" };
  if (name.length > LIMITS.roomName) {
    return { error: `部屋の名前は${LIMITS.roomName}文字までです` };
  }

  const room = await store.createRoom({ id: publicId(), adminKey: adminKey(), name });
  redirect(`/room/${room.adminKey}`);
}

export async function postMessage(
  roomId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const author = text(formData, "author");
  const body = text(formData, "body").replace(/\r\n/g, "\n");
  const color = text(formData, "color");
  const stamp = text(formData, "stamp");

  if (!author) return { error: "お名前を入れてください" };
  if (!body) return { error: "メッセージを入れてください" };
  if (author.length > LIMITS.authorName) {
    return { error: `お名前は${LIMITS.authorName}文字までです` };
  }
  if (body.length > LIMITS.message) {
    return { error: `メッセージは${LIMITS.message}文字までです` };
  }
  if (!INK_COLORS.some((c) => c.id === color)) return { error: "文字の色を選んでください" };
  if (!STAMPS.some((s) => s.id === stamp)) return { error: "スタンプを選んでください" };

  const room = await store.getRoom(roomId);
  if (!room) return { error: "このお部屋は見つかりませんでした" };

  await store.addMessage({ id: messageId(), roomId, author, body, color, stamp });
  return { ok: true };
}
