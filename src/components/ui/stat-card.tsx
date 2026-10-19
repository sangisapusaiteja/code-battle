import { cn } from "@/lib/utils";
import { ACCENT, textGlow, type AccentName } from "@/lib/ui";

/** Metric tile used on the dashboard and profile pages. */
export function StatCard({
  label,
  value,
  color = "emerald",
  sub,
  className,
}: {
  label: string;
  value: number | string;
  color?: AccentName;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 transition-colors duration-200 hover:border-neutral-700",
        className,
      )}
    >
      <p
        className="text-3xl font-extrabold"
        style={{ color: ACCENT[color], textShadow: textGlow(color, 0.25) }}
      >
        {value}
      </p>
      <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      {sub && (
        <p className="mt-0.5 text-[10px] normal-case tracking-normal text-neutral-600">
          {sub}
        </p>
      )}
    </div>
  );
}
