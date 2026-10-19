/**
 * Shared UI tokens: the accent palette, glow helpers and tone class maps.
 *
 * Surfaces, borders and text stay on Tailwind `neutral-*` utilities so the
 * `.light` / `.read` theme remaps in globals.css keep working. Only accents
 * live here.
 */

export const ACCENT = {
  emerald: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  sky: "#0ea5e9",
  violet: "#8b5cf6",
} as const;

export type AccentName = keyof typeof ACCENT;

function resolveAccent(color: AccentName | string): string {
  return color in ACCENT ? ACCENT[color as AccentName] : color;
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** box-shadow glow for highlighted surfaces and primary CTAs. */
export function glow(color: AccentName | string = "emerald", strength = 0.3): string {
  return `0 0 40px ${hexToRgba(resolveAccent(color), strength)}`;
}

/** text-shadow glow for large accent numerals / headings. */
export function textGlow(color: AccentName | string = "emerald", strength = 0.3): string {
  return `0 0 20px ${hexToRgba(resolveAccent(color), strength)}`;
}

export type Tone = "accent" | "warn" | "danger" | "neutral" | "sky" | "violet";

export const TONE_CLASSES: Record<Tone, string> = {
  accent: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  warn: "border-[#f59e0b]/20 bg-[#f59e0b]/10 text-[#f59e0b]",
  danger: "border-[#ef4444]/20 bg-[#ef4444]/10 text-[#ef4444]",
  neutral: "border-neutral-700 bg-neutral-900/60 text-neutral-300",
  sky: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  violet: "border-violet-500/20 bg-violet-500/10 text-violet-400",
};

/** Map a problem difficulty to a UI tone (replaces the four inline copies). */
export function difficultyTone(difficulty: string): Tone {
  const d = difficulty.toLowerCase();
  if (d === "easy") return "accent";
  if (d === "medium") return "warn";
  return "danger";
}

/** Default card / panel surface. */
export const CARD_SURFACE = "rounded-xl border border-neutral-800 bg-neutral-900/60";
