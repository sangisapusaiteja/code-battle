"use client";

import { useCallback, useEffect, useState } from "react";

type Status = "idle" | "submitting" | "success";

interface AccountInfo {
  username: string;
  avatarUrl: string | null;
  isGoogleUser: boolean;
  hasPassword: boolean;
}

/**
 * Sign-in details card for the profile page:
 * - No password yet (Google sign-up) → "Create password" (new + confirm).
 * - Password exists                  → "Change password" (current + new + confirm).
 */
export default function ProfileAccountCard() {
  const [info, setInfo] = useState<AccountInfo | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/set-password", { cache: "no-store" });
      if (!res.ok) return;
      setInfo((await res.json()) as AccountInfo);
    } catch {
      // ignore — card simply stays hidden
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (info?.hasPassword && !currentPassword) {
      setError("Enter your current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password must match.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          info?.hasPassword ? { currentPassword, newPassword } : { newPassword }
        ),
      });
      const payload = (await res.json()) as { error?: string; mode?: string };

      if (!res.ok) throw new Error(payload.error ?? "Something went wrong.");

      setSuccess(
        payload.mode === "created"
          ? "Password created! You can now sign in with it too."
          : "Your password has been updated."
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setStatus("idle");
    }
  }

  if (!loaded || !info) return null;

  const inputClass =
    "mt-2 w-full rounded-xl border border-neutral-700 bg-black px-3 py-2.5 text-sm text-neutral-100 outline-none transition-colors focus:border-emerald-500/50 placeholder:text-neutral-600 disabled:opacity-60";

  return (
    <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
          Sign-in details
        </h2>
        {info.isGoogleUser && (
          <span className="flex items-center gap-1.5 rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-400">
            <svg viewBox="0 0 24 24" aria-hidden className="h-3 w-3">
              <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.6 14.6 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12S6.9 21.3 12 21.3c6.1 0 9.1-4.3 9.1-6.5 0-.4 0-.8-.1-1.1H12Z" />
              <path fill="#34A853" d="M2.8 7.3l3.2 2.3C6.8 7.9 9.1 6 12 6c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.6 14.6 2.7 12 2.7c-3.6 0-6.8 2.1-8.3 4.6Z" />
              <path fill="#FBBC05" d="M12 21.3c2.5 0 4.7-.8 6.3-2.3l-2.9-2.4c-.8.6-1.9 1.1-3.4 1.1-3.9 0-5.1-2.6-5.4-3.8l-3.2 2.4c1.5 2.9 4.5 5 8.6 5Z" />
              <path fill="#4285F4" d="M21.1 13.7c.1-.3.2-.8.2-1.3s-.1-1-.2-1.3H12v3.9h5.4c-.3 1.2-1.2 2.2-2 2.8l2.9 2.4c1.7-1.6 2.8-3.9 2.8-6.5Z" />
            </svg>
            Google account
          </span>
        )}
      </div>

      {!info.hasPassword && (
        <p className="-mt-2 mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs leading-5 text-emerald-300">
          You signed up with Google and don&apos;t have a password yet. Create one
          below to also sign in with your username directly.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {info.hasPassword && (
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-neutral-500">
              Current password
            </span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
              required
              disabled={status === "submitting"}
              className={inputClass}
            />
          </label>
        )}

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            New password
          </span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={info.hasPassword ? "Enter new password" : "Create a password"}
            autoComplete="new-password"
            required
            minLength={8}
            disabled={status === "submitting"}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            Confirm new password
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={status === "submitting"}
            className={inputClass}
          />
        </label>

        {error && (
          <p className="rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-2.5 text-sm text-[#ef4444]">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-emerald-500 disabled:opacity-40"
        >
          {status === "submitting"
            ? "Saving…"
            : info.hasPassword
              ? "Change password"
              : "Create password"}
        </button>
      </form>
    </div>
  );
}
