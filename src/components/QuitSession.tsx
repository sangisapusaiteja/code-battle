"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuitSessionProps {
  label?: string;
  title?: string;
  message?: string;
  confirmLabel?: string;
  redirectTo?: string;
}

export default function QuitSession({
  label = "Quit",
  title = "Quit Session?",
  message = "Your unsaved progress in this session will be lost.",
  confirmLabel = "Quit",
  redirectTo = "/play",
}: QuitSessionProps) {
  const [open, setOpen] = useState(false);
  const [quitting, setQuitting] = useState(false);
  const router = useRouter();

  function handleConfirm() {
    if (quitting) return;
    setQuitting(true);
    router.push(redirectTo);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-xs font-bold rounded-md border border-[#ef4444]/30 text-[#ef4444] transition-all duration-200 hover:bg-[#ef4444]/5"
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
          <div
            className="w-full max-w-sm rounded-2xl border border-neutral-700 bg-neutral-900 p-8 text-center"
            style={{ boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}
          >
            <h2 className="text-xl font-bold text-neutral-100">{title}</h2>
            <p className="mt-3 text-sm text-neutral-400">{message}</p>
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setOpen(false)}
                disabled={quitting}
                className="flex-1 py-3 text-sm font-semibold rounded-xl border border-neutral-700 text-neutral-300 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-50"
              >
                Keep Coding
              </button>
              <button
                onClick={handleConfirm}
                disabled={quitting}
                className="flex-1 py-3 text-sm font-bold rounded-xl border border-[#ef4444]/30 text-[#ef4444] transition-all duration-200 hover:bg-[#ef4444]/5 disabled:opacity-50"
              >
                {quitting ? "Quitting…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
