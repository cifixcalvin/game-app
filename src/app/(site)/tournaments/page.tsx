import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal, Trophy, X } from "lucide-react";

import { Pagination } from "@/components/pagination";
import { TournamentCard } from "@/components/tournament-card";
import { GAMES, getGame } from "@/lib/constants";
import { listTournaments } from "@/lib/tournaments";
import { buildQuery, cn, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tournaments",
  description:
    "Browse live, upcoming, and completed esports tournaments across Valorant, BGMI, PUBG, CS2, Free Fire, Call of Duty Mobile, Apex Legends, and Fortnite.",
};

const TABS = [
  { value: "all", label: "All events" },
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "Live now" },
  { value: "completed", label: "Completed" },
] as const;

type SearchParams = Promise<{
  game?: string;
  status?: string;
  q?: string;
  page?: string;
}>;

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = TABS.some((tab) => tab.value === params.status)
    ? (params.status as (typeof TABS)[number]["value"])
    : "all";
  const game = GAMES.find((item) => item.id === params.game)?.id ?? "all";
  const search = params.q?.trim().slice(0, 80) ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const result = await listTournaments({
    scope: "public",
    status,
    game,
    search,
    page,
    sort: status === "completed" ? "newest" : "soonest",
  });

  const activeGame = game !== "all" ? getGame(game) : null;
  const hasFilters = status !== "all" || game !== "all" || search.length > 0;
  const queryParams = { status, game, q: search || undefined };

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 grid-lines opacity-25" />
        <div className="absolute -top-32 right-[10%] h-80 w-80 rounded-full bg-[#b6ff2e]/[0.07] blur-[100px]" />
        <div className="container-shell relative py-14 sm:py-20">
          <p className="eyebrow">The bracket board</p>
          <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="display text-[42px] leading-[0.98] font-bold tracking-tight text-white sm:text-[60px]">
                Find your <span className="neon-text">arena.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/45">
                Every open registration, live lobby, and completed bracket in
                one place. Filter by title, lock your squad, and go compete.
              </p>
            </div>
            <div className="mono flex items-center gap-4 text-[10px] tracking-[0.12em] text-white/30 uppercase">
              <span>
                <span className="text-[#b6ff2e]">{formatNumber(result.total)}</span>{" "}
                events found
              </span>
              <span className="h-4 w-px bg-white/10" />
              <span>{GAMES.length} titles</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-10 sm:py-12">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((tab) => (
              <Link
                key={tab.value}
                href={`/tournaments${buildQuery(
                  { game, q: search || undefined },
                  { status: tab.value },
                )}`}
                className={cn(
                  "mono rounded-full border px-4 py-2 text-[10px] font-medium tracking-[0.12em] uppercase transition-colors",
                  status === tab.value
                    ? "border-[#b6ff2e] bg-[#b6ff2e] text-black"
                    : "border-white/10 text-white/45 hover:border-white/25 hover:text-white",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <form
            action="/tournaments"
            className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"
          >
            <input type="hidden" name="status" value={status} />
            <label className="relative min-w-0 flex-1 lg:w-52">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-white/25" />
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Search events"
                className="field h-10 pl-10 text-[13px]"
              />
            </label>
            <label className="relative">
              <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
              <select
                name="game"
                defaultValue={game}
                className="field h-10 appearance-none pr-8 pl-9 text-[12px]"
                aria-label="Filter by game"
              >
                <option value="all">All titles</option>
                {GAMES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn-secondary h-10 px-4 text-[10px]">
              Apply
            </button>
          </form>
        </div>

        {hasFilters ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mono text-[9px] tracking-[0.14em] text-white/25 uppercase">
              Active filters
            </span>
            {status !== "all" ? (
              <FilterChip label={TABS.find((tab) => tab.value === status)?.label ?? status} href={`/tournaments${buildQuery({ game, q: search || undefined }, { status: "all" })}`} />
            ) : null}
            {activeGame ? (
              <FilterChip
                label={activeGame.name}
                href={`/tournaments${buildQuery({ status, q: search || undefined }, { game: "all" })}`}
              />
            ) : null}
            {search ? (
              <FilterChip
                label={`“${search}”`}
                href={`/tournaments${buildQuery({ status, game }, { q: undefined })}`}
              />
            ) : null}
            <Link
              href="/tournaments"
              className="mono ml-1 inline-flex items-center gap-1 text-[9px] tracking-[0.12em] text-white/35 uppercase hover:text-white/70"
            >
              Clear all <X className="h-3 w-3" />
            </Link>
          </div>
        ) : null}

        {result.items.length ? (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((tournament, index) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  index={index}
                />
              ))}
            </div>
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              path="/tournaments"
              params={queryParams}
            />
          </>
        ) : (
          <div className="surface mt-8 rounded-2xl px-6 py-20 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/[0.03]">
              <Trophy className="h-6 w-6 text-white/25" />
            </div>
            <h2 className="display mt-5 text-2xl font-semibold text-white">
              No events on this board
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
              Try a different title or status. New brackets drop every week, so
              check back soon.
            </p>
            <Link href="/tournaments" className="btn-secondary mt-6">
              Reset filters
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

function FilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="chip border-[#b6ff2e]/25 bg-[#b6ff2e]/[0.06] text-[#d7ff8a] hover:bg-[#b6ff2e]/[0.12]"
    >
      {label}
      <X className="h-3 w-3" />
    </Link>
  );
}
