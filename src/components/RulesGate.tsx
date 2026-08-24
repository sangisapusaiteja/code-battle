"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RULES_NEXT_KEY, consumePassedFlag } from "@/lib/rules";

/**
 * Every visit to an immersive screen (battle / solo) must arrive via
 * the instructions page. If the player deep-links straight here, they
 * are sent to /instructions and resume afterwards. A one-shot flag
 * lets players who just read the instructions through.
 */
export default function RulesGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (consumePassedFlag()) return;
    try {
      sessionStorage.setItem(RULES_NEXT_KEY, pathname);
    } catch {}
    router.replace("/instructions");
  }, [pathname, router]);

  return null;
}
