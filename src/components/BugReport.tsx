"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

type Status = "idle" | "submitting" | "success" | "error";

const BUG_TYPES = [
  "Visual glitch",
  "Broken feature",
  "Wrong content",
  "Performance issue",
  "Other",
];

const emptySubscribe = () => () => {};

export default function BugReport({ triggerClassName = "" }: { triggerClassName?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [bugType, setBugType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  // Portals need the real DOM — skip during SSR/hydration.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  function reset() {
    setBugType("");
    setTitle("");
    setDescription("");
    setEmail("");
    setStatus("idle");
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bugType || !title.trim()) return;
    setStatus("submitting");

    try {
      const res = await fetch("/api/report-bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: bugType,
          title: title.trim(),
          description: description.trim(),
          email: email.trim(),
          page: pathname,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setTimeout(close, 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={triggerClassName || "text-xs font-medium text-neutral-500 transition-colors duration-200 hover:text-emerald-400"}
      >
        🐛 Report a bug
      </button>

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-5"
            style={{ boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}
          >
            {status === "success" ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <span className="text-3xl">✅</span>
                <p className="text-sm font-bold text-neutral-100">Bug report submitted!</p>
                <p className="text-xs text-neutral-500">Thanks for helping improve Code Battle.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-base font-bold text-neutral-100">🐛 Report a Bug</h2>
                  <p className="mt-0.5 text-xs text-neutral-400">Found something broken? Let us know.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Type */}
                  <div>
                    <span className="mb-1 block text-xs font-semibold text-neutral-300">
                      Bug Type <span className="text-[#ef4444]">*</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {BUG_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setBugType(t)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                            bugType === t
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : "border-neutral-700 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="bug-title" className="mb-1 block text-xs font-semibold text-neutral-300">
                      Title <span className="text-[#ef4444]">*</span>
                    </label>
                    <input
                      id="bug-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Short summary of the bug"
                      required
                      className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-1.5 text-sm text-neutral-100 outline-none transition-colors focus:border-emerald-500/40 placeholder:text-neutral-600"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="bug-desc" className="mb-1 block text-xs font-semibold text-neutral-300">
                      Description
                    </label>
                    <textarea
                      id="bug-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What happened? What did you expect?"
                      rows={2}
                      className="w-full resize-none rounded-lg border border-neutral-700 bg-black px-3 py-1.5 text-sm text-neutral-100 outline-none transition-colors focus:border-emerald-500/40 placeholder:text-neutral-600"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="bug-email" className="mb-1 block text-xs font-semibold text-neutral-300">
                      Email <span className="font-normal text-neutral-600">(optional)</span>
                    </label>
                    <input
                      id="bug-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="If you want a follow-up"
                      className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-1.5 text-sm text-neutral-100 outline-none transition-colors focus:border-emerald-500/40 placeholder:text-neutral-600"
                    />
                  </div>

                  <p className="text-[11px] text-neutral-600">
                    Page: <span className="font-mono">{pathname}</span>
                  </p>

                  {status === "error" && (
                    <p className="text-xs text-[#ef4444]">Something went wrong. Please try again.</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={close}
                      className="flex-1 py-2 text-sm font-semibold rounded-xl border border-neutral-700 text-neutral-300 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!bugType || !title.trim() || status === "submitting"}
                      className="flex-1 py-2 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200 disabled:opacity-40"
                    >
                      {status === "submitting" ? "Submitting…" : "Submit Report"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
          </div>,
          document.body
        )}
    </>
  );
}
