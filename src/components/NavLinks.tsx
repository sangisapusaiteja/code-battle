"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, History, User, Shield } from "lucide-react";

interface NavLinkItem {
  href: string;
  label: string;
  icon?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  trophy: Trophy,
  history: History,
  user: User,
  shield: Shield,
};

const underline =
  "after:absolute after:left-2.5 after:right-2.5 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-emerald-400/70 after:transition-transform after:duration-200";

export default function NavLinks({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="hidden min-w-0 flex-1 items-center lg:flex">
      <div className="flex items-center gap-1 px-1 text-sm whitespace-nowrap">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href + "/"));
          const Icon = iconMap[link.icon ?? ""];
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative rounded-md px-2.5 py-2 text-sm font-medium transition-colors duration-200 ${underline} ${
                isActive
                  ? "text-emerald-400 after:scale-x-100"
                  : "text-neutral-400 hover:text-neutral-100 hover:after:scale-x-100"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
