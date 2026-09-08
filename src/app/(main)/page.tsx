import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  Swords,
  Trophy,
  Timer,
  Target,
  Zap,
  BookOpen,
  Users,
} from "lucide-react";

export const metadata = { title: "Code Battle — Real-time Coding Battles" };
export const dynamic = "force-dynamic";

const features = [
  {
    icon: Swords,
    title: "Real-time 1v1 Duels",
    desc: "Face a friend on the same problems, under the same clock. Fastest mind wins.",
  },
  {
    icon: Timer,
    title: "Same Problem, Same Timer",
    desc: "Both players solve identical problem sets in sequence — no unfair advantages.",
  },
  {
    icon: Trophy,
    title: "ELO Rating System",
    desc: "Every match updates a real Elo rating. Beat higher-rated players to climb fast.",
  },
  {
    icon: Zap,
    title: "XP & Levels",
    desc: "Earn XP for correct solo solutions and match wins. Levels reflect your grind.",
  },
  {
    icon: Target,
    title: "Solo Practice",
    desc: "Sharpen your skills alone on individual problems or curated problem sets.",
  },
  {
    icon: Users,
    title: "Global Leaderboard",
    desc: "See exactly where you rank against every player on the platform.",
  },
];

export default async function LandingPage() {
  const session = await getSession();

  let username: string | null = null;
  if (session) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("users")
      .select("username")
      .eq("id", session.userId)
      .single();
    username = data?.username ?? null;
  }

  const ctaHref = session ? "/play" : "/signup";

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[380px] w-[380px] rounded-full bg-emerald-400/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 sm:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Now live · Compete in real time
          </span>

          <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight">
            <span className="text-neutral-100">Code</span>
            <span className="text-emerald-400" style={{ textShadow: "0 0 40px rgba(34,197,94,0.4)" }}>
              Battle
            </span>
            <br />
            <span className="text-neutral-300">your way to the top</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400 leading-relaxed">
            Practice coding interviews by competing against real developers. Face off on the
            same problems, under the same clock, in real time across devices.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={ctaHref}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105 text-center whitespace-nowrap"
              style={{ boxShadow: "0 0 40px rgba(34,197,94,0.3)" }}
            >
              {session ? (username ? `Continue as ${username} ⚔️` : "Battle Now ⚔️") : "Get Started — It's Free"}
            </Link>
            {!session && (
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl border border-emerald-500/30 text-emerald-400 transition-all duration-300 hover:bg-emerald-500/10 hover:scale-105 text-center whitespace-nowrap"
              >
                I have an account
              </Link>
            )}
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-neutral-500">
            <BookOpen className="h-3.5 w-3.5" />
            <span>One account works across Code Battle and Interview Handbook</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-100">
          Built for the rush of competition
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-400">
          Everything you need to practice, compete, and climb — in one place.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 transition-all duration-200 hover:border-emerald-500/30 hover:bg-neutral-900/80"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-neutral-100">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-neutral-900/60 p-10 sm:p-14 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[90px]" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-100">
              Ready to enter the arena?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-neutral-400">
              Create your free account, pick your problems, and challenge the world.
            </p>
            <Link
              href={ctaHref}
              className="mt-6 inline-flex px-10 py-4 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:scale-105"
              style={{ boxShadow: "0 0 40px rgba(34,197,94,0.3)" }}
            >
              {session ? "Battle Now ⚔️" : "Create Free Account"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
