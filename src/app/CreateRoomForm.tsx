"use client";

import { useActionState } from "react";
import { LIMITS } from "@/lib/constants";
import { createRoom, type FormState } from "./actions";

export function CreateRoomForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createRoom, {});

  return (
    <form action={action} className="card p-6 sm:p-7">
      <label htmlFor="room-name" className="font-mincho mb-3 block font-bold">
        部屋の名前
      </label>
      <input
        id="room-name"
        name="name"
        required
        maxLength={LIMITS.roomName}
        placeholder="例：田中さん 送別会"
        autoComplete="off"
        className="field"
      />
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-[#a2453d]">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary font-mincho mt-4 w-full text-lg">
        {pending ? "つくっています…" : "部屋をつくる"}
      </button>
    </form>
  );
}
