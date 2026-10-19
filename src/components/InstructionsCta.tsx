"use client";

import { useRouter } from "next/navigation";
import { Check, Swords } from "lucide-react";
import { RULES_NEXT_KEY, RULES_PASSED_KEY } from "@/lib/rules";
import { Button } from "@/components/ui/button";
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
    <Button size="lg" onClick={go}>
      {pending ? (
        <>
          <Check className="h-4 w-4" />
          I&apos;ve read it — continue to my game
        </>
      ) : (
        <>
          <Swords className="h-4 w-4" />
          Enter the Arena
        </>
      )}
    </Button>
  );
}
