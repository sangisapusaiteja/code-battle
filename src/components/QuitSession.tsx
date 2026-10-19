"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
          <div
            className="w-full max-w-sm rounded-2xl border border-neutral-700 bg-neutral-900 p-8 text-center"
            style={{ boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}
          >
            <h2 className="text-xl font-bold text-neutral-100">{title}</h2>
            <p className="mt-3 text-sm text-neutral-400">{message}</p>
            <div className="mt-8 flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
                disabled={quitting}
              >
                Keep Coding
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleConfirm}
                disabled={quitting}
              >
                {quitting ? "Quitting…" : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
