"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Logo } from "./logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050706]/80 backdrop-blur-xl">
      <div className="container-shell flex h-[72px] items-center justify-between gap-6">
        <div onClick={() => setOpen(false)}>
          <Logo />
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mono relative rounded-full px-4 py-2 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors",
                isActive(item.href)
                  ? "text-white"
                  : "text-white/45 hover:text-white/85",
              )}
            >
              {item.label}
              {isActive(item.href) ? (
                <span className="absolute inset-x-4 -bottom-[1px] h-px bg-[#b6ff2e]" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/tournaments" className="btn-primary hidden sm:inline-flex">
            Find your arena
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-[#b6ff2e]/40 hover:text-white lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto border-t border-white/[0.06] bg-[#050706]/98 backdrop-blur-2xl lg:hidden">
          <nav className="container-shell flex flex-col py-8" aria-label="Mobile">
            {NAV.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "display flex items-center justify-between border-b border-white/[0.07] py-5 text-2xl font-semibold tracking-tight transition-colors",
                  isActive(item.href) ? "text-[#b6ff2e]" : "text-white/80",
                )}
              >
                <span className="flex items-center gap-4">
                  <span className="mono text-[10px] font-normal tracking-[0.2em] text-white/25">
                    0{index + 1}
                  </span>
                  {item.label}
                </span>
                <ArrowUpRight className="h-4 w-4 text-white/30" />
              </Link>
            ))}
            <Link
              href="/tournaments"
              onClick={() => setOpen(false)}
              className="btn-primary mt-8 w-full"
            >
              Browse tournaments
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="mono mt-4 text-center text-[10px] tracking-[0.16em] text-white/25 uppercase hover:text-white/50"
            >
              Organiser login
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
