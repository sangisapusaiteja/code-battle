"use client";

import { useRouter } from "next/navigation";
import { navigateToGame } from "@/lib/rules";

/**
 * Button that enters a game screen, routing through /instructions
 * first when they haven't been acknowledged yet.
 */
export default function GameEntryButton({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <button onClick={() => navigateToGame(router, href)} className={className}>
      {children}
    </button>
  );
}
