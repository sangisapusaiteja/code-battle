import Link from "next/link";
import InstructionsCta from "@/components/InstructionsCta";

export const metadata = { title: "How It Works — CodeBattle" };

export default function InstructionsPage() {
  return (
    <div className="w-full min-h-screen px-6 sm:px-10 lg:px-14">
      <div className="w-full px-6 sm:px-10 lg:px-14 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-emerald-400" style={{ textShadow: "0 0 20px rgba(34,197,94,0.3)" }}>How It Works</span>
        </h1>
        <p className="mt-2 text-neutral-400">Everything you need to know before your first battle.</p>

        <div className="mt-2 mb-8 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        {/* Battle flow */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          <h2 className="text-lg font-bold text-emerald-400">⚔️ The Battle Flow</h2>
          <ol className="mt-4 space-y-3 text-sm text-neutral-300 list-none">
            {[
              "Host picks the problems and creates a room — a short code is generated.",
              "A friend joins from anywhere by entering that code.",
              "Host starts the match and after a quick countdown, both players get the same problems.",
              "Solve each problem in the code editor and submit — sample tests run instantly.",
              "When both players finish (or someone concedes), the server decides the winner: correctness first, then speed.",
              "Ratings and XP update automatically. Nobody can cheat the result.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-400">{i + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* XP */}
        <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          <h2 className="text-lg font-bold text-emerald-400">⚡ Earning XP</h2>
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
          <h2 className="text-lg font-bold text-emerald-400">🏆 Your Rating</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-300">
            <li>• Everyone starts at the same rating.</li>
            <li>• Win a battle → your rating goes up. Lose → it goes down.</li>
            <li>• Beating someone ranked <strong className="text-neutral-100">above you</strong> gives a bigger boost; losing to someone below you hurts more.</li>
            <li>• Only battles change your rating — solo practice is risk-free.</li>
          </ul>
        </section>

        {/* Levels */}
        <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          <h2 className="text-lg font-bold text-emerald-400">📈 Levels & Streaks</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-300">
            <li>• As your XP grows, your <strong className="text-neutral-100">level rises automatically</strong>.</li>
            <li>• Solving problems day after day builds a <strong className="text-neutral-100">streak</strong> — miss a day and it resets to zero.</li>
            <li>• Your full rating history lives on your profile.</li>
          </ul>
        </section>

        {/* Fair play */}
        <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
          <h2 className="text-lg font-bold text-emerald-400">🛡️ Fair Play</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-300">
            <li>• Battles run in <strong className="text-neutral-100">fullscreen</strong> so both players compete under identical conditions.</li>
            <li>• Only your last answer for each problem counts.</li>
            <li>• Conceding counts as a loss; your opponent takes the win.</li>
          </ul>
        </section>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 pb-8">
          <InstructionsCta />
          <Link
            href="/dashboard"
            className="px-8 py-3.5 text-base font-semibold rounded-xl border border-neutral-700 text-neutral-300 transition-all duration-200 hover:border-emerald-500/30 hover:text-emerald-400"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
