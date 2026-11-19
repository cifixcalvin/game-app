import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Nexus Arena home"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <span className="relative grid h-9 w-9 place-items-center border border-[#b6ff2e]/40 bg-[#b6ff2e]/5 transition-colors group-hover:border-[#b6ff2e] group-hover:bg-[#b6ff2e]/10">
        <svg
          viewBox="0 0 36 36"
          className="h-5 w-5 text-[#b6ff2e]"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 29V7h6.2l9.3 13.6V7H29v22h-6.1L13.5 15.4V29H7Z"
            fill="currentColor"
          />
          <path d="M4 4h5M4 4v5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M32 32h-5M32 32v-5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        <span className="absolute -right-1 -bottom-1 h-1.5 w-1.5 bg-[#b6ff2e]" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="display text-[15px] font-bold tracking-[0.16em] text-white">
          NEXUS<span className="text-[#b6ff2e]">.</span>
        </span>
        <span className="mono mt-1 text-[8px] font-medium tracking-[0.34em] text-white/40 uppercase">
          Arena Esports
        </span>
      </span>
    </Link>
  );
}
