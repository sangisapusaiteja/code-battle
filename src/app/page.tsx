import { getSession } from "@/lib/auth/session";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";

export default async function Home() {
  const user = await getSession();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-emerald-400/5 blur-[120px]" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl flex justify-center gap-5">
          <LogoMark size="md" />
          <span className="text-neutral-100">Code</span>{" "}
          <span className="text-emerald-400" style={{ textShadow: "0 0 30px rgba(34,197,94,0.4)" }}>
            Battle
          </span>
        </h1>

        <p className="mt-6 max-w-xl mx-auto text-lg leading-relaxed text-neutral-400">
          Challenge developers to real-time coding duels. Same problem, same
          clock — only the fastest mind wins.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105"
            >
              Enter the Arena
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105"
              >
                Start Battling
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-xl border border-emerald-500/30 text-emerald-400 transition-all duration-300 hover:bg-emerald-500/10 hover:scale-105"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: "⚔️", text: "Real-time 1v1 Duels" },
            { icon: "🏆", text: "ELO Ranking" },
            { icon: "⚡", text: "Instant Execution" },
            { icon: "🐍", text: "JS · TS · Python" },
          ].map((f) => (
            <span
              key={f.text}
              className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-5 py-2.5 text-sm text-neutral-300 transition-all duration-200 hover:border-emerald-500/20 hover:bg-neutral-900"
            >
              <span className="text-base">{f.icon}</span>
              {f.text}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
