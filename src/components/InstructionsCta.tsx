"use client";

import { useRouter } from "next/navigation";
import { RULES_NEXT_KEY, RULES_PASSED_KEY } from "@/lib/rules";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

function readPending(): string | null {
  try {
    return sessionStorage.getItem(RULES_NEXT_KEY);
  } catch {
    return null;
  }
}

/**
 * Primary CTA on the instructions page. Marks the rules as read for
 * this session and resumes the player's intended game destination —
 * or heads to the arena on a casual visit.
 */
export default function InstructionsCta() {
  const router = useRouter();
  const pending = useSyncExternalStore(emptySubscribe, readPending, () => null);

  function go() {
    try {
      sessionStorage.setItem(RULES_PASSED_KEY, String(Date.now()));
      sessionStorage.removeItem(RULES_NEXT_KEY);
    } catch {}
    router.push(pending ?? "/play");
  }

  return (
    <button
      onClick={go}
      className="px-8 py-3.5 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105"
    >
      {pending ? "✓ I've read it — continue to my game" : "⚔️ Enter the Arena"}
    </button>
  );
}
