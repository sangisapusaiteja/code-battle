"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import {
  ChevronRight,
  History,
  LogOut,
  Shield,
  ShieldCheck,
  Trophy,
  User,
} from "lucide-react";
import { useState, useTransition } from "react";
import Avatar from "./Avatar";
import SecurityDialog from "./SecurityDialog";
import { logout } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  username: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
}

const itemClass =
  "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm text-neutral-100 transition hover:bg-neutral-800";

export default function UserMenu({
  username,
  avatarUrl,
  isAdmin = false,
}: UserMenuProps) {
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  const items = [
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/history", label: "History", icon: History },
    { href: "/profile", label: "Profile", icon: User },
    ...(isAdmin
      ? [{ href: "/admin/problems", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <>
      <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="Open account menu"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-700 bg-black transition hover:border-emerald-500/40 hover:bg-neutral-900"
          >
            <Avatar
              src={avatarUrl}
              name={username}
              className="h-full w-full text-xs font-semibold text-neutral-100"
            />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={10}
            align="end"
            className="z-[95] w-[300px] rounded-[28px] border border-neutral-700 bg-neutral-900 p-3 text-neutral-100 shadow-2xl"
          >
            <div className="rounded-3xl border border-neutral-800 bg-neutral-800 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-700 bg-neutral-900">
                  <Avatar
                    src={avatarUrl}
                    name={username}
                    className="h-full w-full text-sm font-semibold text-neutral-100"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-100">
                    {username}
                  </p>
                  <p className="truncate text-sm text-neutral-400">
                    Code Battle member
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              {items.map((item) => (
                <DropdownMenu.Item key={item.href} asChild>
                  <Link href={item.href} className={itemClass}>
                    <span className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-neutral-400" />
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-neutral-500" />
                  </Link>
                </DropdownMenu.Item>
              ))}

              <DropdownMenu.Item asChild>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSecurityOpen(true);
                  }}
                  className={itemClass}
                >
                  <span className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-neutral-400" />
                    <span>Security</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-500" />
                </button>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await logout();
                    })
                  }
                  className={cn(itemClass, "disabled:opacity-60")}
                >
                  <span className="flex items-center gap-3">
                    <LogOut className="h-4 w-4 text-neutral-400" />
                    <span>Sign out</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-500" />
                </button>
              </DropdownMenu.Item>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <SecurityDialog open={securityOpen} onOpenChange={setSecurityOpen} />
    </>
  );
}
