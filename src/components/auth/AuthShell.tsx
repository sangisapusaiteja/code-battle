import Link from "next/link";
import LogoMark from "@/components/LogoMark";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

const highlights = [
  "Battle friends with a room code",
  "Solo practice with instant tests",
  "Climb the global leaderboard",
];

const features = [
  { icon: "⚔️", title: "Real-time Duels", desc: "Same problem, same clock — fastest correct solution wins." },
  { icon: "🏆", title: "Elo & XP", desc: "Earn XP for every solve and move up the ranks with each victory." },
  { icon: "🧠", title: "Sharpen Skills", desc: "Practice any problem solo, or jump straight into a match." },
];

export default function AuthShell({ title, description, children }: Readonly<AuthShellProps>) {
  return (
    <div className="relative h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.08),transparent_30%)]" />

      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-6 sm:gap-10 px-4 py-6 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-10">
        {/* Left — brand story */}
        <section className="hidden h-full lg:flex lg:flex-col lg:justify-center">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-xs text-neutral-100 transition-colors hover:border-emerald-500/30"
          >
            <LogoMark size="xs" />
            Code Battle
          </Link>

          <div className="mt-6 max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
              ⚔️ The competitive coding arena
            </p>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-neutral-50">
              {title}
            </h1>
            <p className="mt-3 max-w-lg text-sm sm:text-base leading-6 sm:leading-7 text-neutral-400">
              {description}
            </p>
          </div>

          <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-colors duration-200 hover:border-emerald-500/20">
                <span className="text-lg">{f.icon}</span>
                <p className="mt-2.5 text-xs font-semibold text-neutral-100">{f.title}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-400">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {highlights.map((h) => (
              <span key={h} className="rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-[11px] text-neutral-400">
                {h}
              </span>
            ))}
          </div>
        </section>

        {/* Right — form */}
        <section className="mx-auto flex w-full max-w-xl items-center justify-center self-center">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-sm text-neutral-100"
              >
                <LogoMark size="xs" />
                Code Battle
              </Link>
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
