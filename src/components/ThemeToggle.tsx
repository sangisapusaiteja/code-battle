"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { BookOpen, Moon, Sun } from "lucide-react";

const MODES = [
  { key: "dark", icon: Moon, label: "Dark mode" },
  { key: "light", icon: Sun, label: "Light mode" },
  { key: "read", icon: BookOpen, label: "Read mode" },
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
    return <div className="h-9 w-9 shrink-0 rounded-xl" aria-hidden />;
  }

  const current = theme ?? resolvedTheme ?? "dark";
  const found = MODES.findIndex((m) => m.key === current);
  const index = found === -1 ? MODES.length - 1 : found;
  const active = MODES[index];
  const next = MODES[(index + 1) % MODES.length];
  const Icon = active.icon;

  return (
    <button
      onClick={() => setTheme(next.key)}
      title={`${active.label} — click for ${next.label}`}
      aria-label={`${active.label} — click for ${next.label}`}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition-colors duration-300 hover:bg-emerald-500/10 hover:text-neutral-100"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
