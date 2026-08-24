"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Blocks immersive screens (battle / solo) until the player enters
 * fullscreen. Browsers require a user gesture, so the screen stays
 * covered by this gate until the player clicks through — there is no
 * skip option. Exiting fullscreen mid-session re-locks the screen.
 */
export default function FullscreenGate({ context = "practice" }: { context?: string }) {
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onChange = () => setLocked(!document.fullscreenElement);
    const initial = window.setTimeout(onChange, 0);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      window.clearTimeout(initial);
      document.removeEventListener("fullscreenchange", onChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const enter = useCallback(async () => {
    setBusy(true);
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen unavailable (e.g. embedded iframe) — let the player in.
      if (!document.fullscreenEnabled) setLocked(false);
    } finally {
      setBusy(false);
    }
  }, []);

  if (!locked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
      <div
        className="relative mx-4 w-full max-w-sm rounded-2xl border border-emerald-500/20 bg-neutral-900 p-8 text-center"
        style={{ boxShadow: "0 0 40px rgba(34,197,94,0.1)" }}
      >
        <div className="text-4xl">⛶</div>
        <h2 className="mt-4 text-xl font-bold text-neutral-100">Fullscreen Required</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          {context === "battle"
            ? "Battles run in fullscreen so both players compete under identical, distraction-free conditions."
            : "Practice runs in fullscreen for a distraction-free session."}
        </p>
        <button
          onClick={enter}
          disabled={busy}
          className="mt-6 w-full px-6 py-3 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105 disabled:opacity-60"
        >
          {busy ? "Entering…" : "Enter Fullscreen"}
        </button>
        <p className="mt-4 text-xs text-neutral-600">Press Esc anytime to exit fullscreen.</p>
      </div>
    </div>
  );
}
