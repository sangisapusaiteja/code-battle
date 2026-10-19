import Link from "next/link";
import { Swords, Zap, Trophy, Rocket, Shield } from "lucide-react";
import InstructionsCta from "@/components/InstructionsCta";
import { PageShell, PageHeader } from "@/components/ui/page-shell";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "How It Works — CodeBattle" };

const battleFlow = [
  "Host picks the problems and creates a room — a short code is generated.",
  "A friend joins from anywhere by entering that code.",
  "Host starts the match and after a quick countdown, both players get the same problems.",
  "Solve each problem in the code editor and submit — sample tests run instantly.",
  "When both players finish (or someone concedes), the server decides the winner: correctness first, then speed.",
  "Ratings and XP update automatically. Nobody can cheat the result.",
];

export default function InstructionsPage() {
  return (
    <PageShell className="min-h-screen">
      <PageHeader
        title="How It Works"
        subtitle="Everything you need to know before your first battle."
      />

      {/* Battle flow */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-400">
          <Swords className="h-5 w-5" />
          The Battle Flow
        </h2>
        <ol className="mt-4 space-y-3 text-sm text-neutral-300">
          {battleFlow.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-400">{i + 1}</span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* XP */}
      <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-400">
          <Zap className="h-5 w-5" />
          Earning XP
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-300">
          <li>• Every problem you solve earns XP.</li>
          <li>• <strong className="text-neutral-100">Harder problems pay more</strong> than easier ones.</li>
          <li>• The more tests your solution passes, the more XP you keep from it.</li>
          <li>• In battles, both players earn XP for what they solve — but the <strong className="text-neutral-100">winner always earns more per problem</strong> than the loser.</li>
          <li>• XP never goes down.</li>
        </ul>
      </section>

      {/* Rating */}
      <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-400">
          <Trophy className="h-5 w-5" />
          Your Rating
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-300">
          <li>• Everyone starts at the same rating.</li>
          <li>• Win a battle → your rating goes up. Lose → it goes down.</li>
          <li>• Beating someone ranked <strong className="text-neutral-100">above you</strong> gives a bigger boost; losing to someone below you hurts more.</li>
          <li>• Only battles change your rating — solo practice is risk-free.</li>
        </ul>
      </section>

      {/* Levels */}
      <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-400">
          <Rocket className="h-5 w-5" />
          Levels &amp; Streaks
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-300">
          <li>• As your XP grows, your <strong className="text-neutral-100">level rises automatically</strong>.</li>
          <li>• Solving problems day after day builds a <strong className="text-neutral-100">streak</strong> — miss a day and it resets to zero.</li>
          <li>• Your full rating history lives on your profile.</li>
        </ul>
      </section>

      {/* Fair play */}
      <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-400">
          <Shield className="h-5 w-5" />
          Fair Play
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-300">
          <li>• Both players face the <strong className="text-neutral-100">same problems under the same clock</strong>, so the conditions are identical.</li>
          <li>• Only your last answer for each problem counts.</li>
          <li>• Conceding counts as a loss; your opponent takes the win.</li>
        </ul>
      </section>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 pb-8 sm:flex-row">
        <InstructionsCta />
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Back to Dashboard
        </Link>
      </div>
    </PageShell>
  );
}
