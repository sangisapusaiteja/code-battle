"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountInfo {
  username: string;
  avatarUrl: string | null;
  isGoogleUser: boolean;
  hasPassword: boolean;
}

export default function SecurityDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [info, setInfo] = useState<AccountInfo | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/auth/set-password", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as AccountInfo;
        if (active) setInfo(data);
      } catch {
        // leave the panel in its loading state
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccess(null);
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!info) return;
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (info.hasPassword && !currentPassword) {
      setError("Enter your current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password must match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          info.hasPassword ? { currentPassword, newPassword } : { newPassword },
        ),
      });
      const payload = (await res.json()) as { error?: string; mode?: string };
      if (!res.ok) throw new Error(payload.error ?? "Something went wrong.");

      setSuccess(
        payload.mode === "created"
          ? "Password created. You can now sign in with your username too."
          : "Your password has been updated.",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      const refreshed = await fetch("/api/auth/set-password", {
        cache: "no-store",
      });
      if (refreshed.ok) setInfo((await refreshed.json()) as AccountInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[100] w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-neutral-700 bg-neutral-900 p-6 text-neutral-100 shadow-2xl">
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-xl text-neutral-500 transition-colors duration-200 hover:text-neutral-100"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          <Dialog.Title className="flex items-center gap-2 pr-8 text-lg font-bold text-neutral-100">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Security
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-neutral-400">
            Manage your password and account.
          </Dialog.Description>

          {!info ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {info.isGoogleUser && !info.hasPassword && (
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3">
                  <p className="text-sm font-semibold text-emerald-300">
                    You signed up with Google
                  </p>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    Create a password below to also sign in with your username.
                  </p>
                </div>
              )}

              {info.hasPassword && (
                <PasswordField
                  label="Current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  disabled={saving}
                />
              )}

              <PasswordField
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder={
                  info.hasPassword ? "Enter new password" : "Create a password"
                }
                autoComplete="new-password"
                minLength={8}
                disabled={saving}
              />

              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                minLength={8}
                disabled={saving}
              />

              {error && (
                <p className="rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-2.5 text-sm text-[#ef4444]">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
                  {success}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving
                  ? "Saving…"
                  : info.hasPassword
                    ? "Update password"
                    : "Create password"}
              </Button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-neutral-300">{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          disabled={disabled}
          className="h-11 w-full rounded-2xl border border-neutral-700 bg-black px-4 pr-11 text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-500 transition-colors duration-200 hover:text-neutral-100 disabled:opacity-60"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
