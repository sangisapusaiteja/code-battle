"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, type AuthResult } from "@/app/auth/actions";
import PasswordInput from "@/components/PasswordInput";
import AuthShell from "@/components/auth/AuthShell";

const googleErrors: Record<string, string> = {
  google_unavailable: "Google sign-in is not configured yet. Use username & password for now.",
  google_failed: "Google sign-in failed. Please try again.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthResult, FormData>(login, undefined);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const error = state?.error ?? (urlError ? googleErrors[urlError] : null);

  return (
    <AuthShell
      title="Welcome back to the arena"
      description="Sign in to resume your battles, keep your streak alive, and climb the leaderboard."
    >
      <div className="w-full rounded-[28px] border border-neutral-800 bg-neutral-900/80 p-6 shadow-[0_30px_120px_-40px_rgba(34,197,94,0.25)] sm:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-50">Sign in</h2>
          <p className="mt-2 text-sm text-neutral-400">Enter your username and password to continue.</p>
        </div>

        <form action={formAction} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-neutral-200">Username</span>
            <input
              name="username"
              autoComplete="username"
              required
              placeholder="your_username"
              disabled={pending}
              className="h-12 w-full rounded-2xl border border-neutral-700 bg-black px-4 text-sm text-neutral-100 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-neutral-200">Password</span>
            <PasswordInput name="password" autoComplete="current-password" required />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-[0_18px_40px_-18px_rgba(34,197,94,0.6)] transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign in
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-800" />
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-600">or</span>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>

          {/* Google */}
          <a
            href="/api/auth/google"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-neutral-700 bg-neutral-900/60 px-4 text-sm font-semibold text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-900"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
              <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.6 14.6 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12S6.9 21.3 12 21.3c6.1 0 9.1-4.3 9.1-6.5 0-.4 0-.8-.1-1.1H12Z" />
              <path fill="#34A853" d="M2.8 7.3l3.2 2.3C6.8 7.9 9.1 6 12 6c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.6 14.6 2.7 12 2.7c-3.6 0-6.8 2.1-8.3 4.6Z" />
              <path fill="#FBBC05" d="M12 21.3c2.5 0 4.7-.8 6.3-2.3l-2.9-2.4c-.8.6-1.9 1.1-3.4 1.1-3.9 0-5.1-2.6-5.4-3.8l-3.2 2.4c1.5 2.9 4.5 5 8.6 5Z" />
              <path fill="#4285F4" d="M21.1 13.7c.1-.3.2-.8.2-1.3s-.1-1-.2-1.3H12v3.9h5.4c-.3 1.2-1.2 2.2-2 2.8l2.9 2.4c1.7-1.6 2.8-3.9 2.8-6.5Z" />
            </svg>
            Continue with Google
          </a>

          <p className="text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-emerald-400 transition hover:text-emerald-300">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
