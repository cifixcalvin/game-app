import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buildQuery, cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  path,
  params = {},
}: {
  page: number;
  totalPages: number;
  path: string;
  params?: Record<string, string | number | undefined>;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter(
      (value) =>
        value === 1 ||
        value === totalPages ||
        Math.abs(value - page) <= 1,
    )
    .reduce<number[]>((acc, value) => {
      const previous = acc[acc.length - 1];
      if (previous && value - previous > 1) acc.push(-1);
      acc.push(value);
      return acc;
    }, []);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <PageLink
        href={`${path}${buildQuery(params, { page: Math.max(1, page - 1) })}`}
        disabled={page === 1}
        label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PageLink>

      {pages.map((value, index) =>
        value === -1 ? (
          <span key={`gap-${index}`} className="px-1 text-white/25">
            …
          </span>
        ) : (
          <Link
            key={value}
            href={`${path}${buildQuery(params, { page: value })}`}
            aria-current={value === page ? "page" : undefined}
            className={cn(
              "mono grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-[11px] transition-colors",
              value === page
                ? "border-[#b6ff2e]/50 bg-[#b6ff2e] text-black"
                : "border-white/10 text-white/50 hover:border-white/25 hover:text-white",
            )}
          >
            {value}
          </Link>
        ),
      )}

      <PageLink
        href={`${path}${buildQuery(params, { page: Math.min(totalPages, page + 1) })}`}
        disabled={page === totalPages}
        label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.05] text-white/15">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/50 transition-colors hover:border-white/25 hover:text-white"
    >
      {children}
    </Link>
  );
}
