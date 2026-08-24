"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const MODES = [
  { key: "dark", icon: "🌙", label: "Dark" },
  { key: "light", icon: "☀️", label: "Light" },
  { key: "read", icon: "📖", label: "Read" },
] as const;

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className="h-9 w-9 rounded-lg border border-neutral-700" aria-hidden />;
  }

  const current = theme ?? resolvedTheme ?? "dark";
  const index = MODES.findIndex((m) => m.key === current);
  const active = MODES[(index + MODES.length) % MODES.length];

  function cycle() {
    const next = MODES[(index + 1) % MODES.length];
    setTheme(next.key);
  }

  return (
    <button
      onClick={cycle}
      title={`Theme: ${active.label} — click to switch`}
      aria-label={`Theme: ${active.label}. Click to switch.`}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-sm transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/10"
    >
      {active.icon}
    </button>
  );
}
