"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Radio,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { logoutAction } from "@/app/admin/auth-actions";
import { Logo } from "@/components/logo";
import { ROLE_LABELS } from "@/lib/constants";
import type { SessionUser } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  superOnly?: boolean;
  badge?: number;
};

export function AdminShell({
  user,
  pending,
  children,
}: {
  user: SessionUser;
  pending: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav: NavItem[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/tournaments", label: "Tournaments", icon: Trophy },
    {
      href: "/admin/registrations",
      label: "Registrations",
      icon: ClipboardList,
      badge: pending,
    },
    {
      href: "/admin/team",
      label: "Team access",
      icon: Users,
      superOnly: true,
    },
    { href: "/admin/account", label: "Account", icon: Settings },
  ];

  const current =
    [...nav]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) =>
        item.exact ? pathname === item.href : pathname.startsWith(item.href),
      )?.label ?? "Console";

  return (
    <div className="min-h-screen bg-[#060806]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-white/[0.07] bg-[#080b08] transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[70px] items-center justify-between border-b border-white/[0.07] px-5">
          <div onClick={() => setOpen(false)}>
            <Logo href="/admin" />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/50 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pt-5">
          <div className="flex items-center gap-2 rounded-lg border border-[#b6ff2e]/15 bg-[#b6ff2e]/[0.045] px-3 py-2">
            <Radio className="h-3.5 w-3.5 text-[#b6ff2e]" />
            <span className="mono text-[9px] tracking-[0.14em] text-[#d7ff8a] uppercase">
              Ops online
            </span>
            <span className="live-dot ml-auto h-1.5 w-1.5 rounded-full bg-[#b6ff2e]" />
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Admin">
          <p className="mono px-3 pb-2 text-[8px] tracking-[0.18em] text-white/20 uppercase">
            Workspace
          </p>
          {nav
            .filter((item) => !item.superOnly || user.role === "super_admin")
            .map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] transition-colors",
                    active
                      ? "bg-white/[0.055] text-white"
                      : "text-white/45 hover:bg-white/[0.03] hover:text-white/80",
                  )}
                >
                  {active ? (
                    <span className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-[#b6ff2e]" />
                  ) : null}
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-[#b6ff2e]" : "text-white/25",
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="mono grid h-5 min-w-5 place-items-center rounded-full bg-[#b6ff2e] px-1 text-[9px] font-bold text-black">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
        </nav>

        <div className="border-t border-white/[0.07] p-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.025] px-3 py-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#b6ff2e]/25 bg-[#b6ff2e]/10 text-[10px] font-semibold text-[#d7ff8a]">
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-white/85">
                {user.name}
              </p>
              <p className="mono mt-0.5 text-[8px] tracking-[0.1em] text-white/30 uppercase">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sign out"
                className="grid h-7 w-7 place-items-center rounded-md text-white/25 hover:bg-white/5 hover:text-red-300"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
          <Link
            href="/"
            target="_blank"
            className="mono mt-2 flex items-center justify-between px-3 py-2 text-[8px] tracking-[0.14em] text-white/25 uppercase hover:text-white/60"
          >
            View live site <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-[70px] items-center gap-3 border-b border-white/[0.07] bg-[#060806]/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/60 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <p className="mono text-[8px] tracking-[0.18em] text-white/25 uppercase">
              Nexus / Admin
            </p>
            <p className="display mt-0.5 text-sm font-semibold text-white">
              {current}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="mono hidden items-center gap-2 text-[8px] tracking-[0.12em] text-white/30 uppercase sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-[#b6ff2e]/60" />
              Secure session
            </span>
            <Link
              href="/"
              target="_blank"
              className="btn-secondary h-9 px-3.5 text-[9px]"
            >
              Live site <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </header>

        <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
