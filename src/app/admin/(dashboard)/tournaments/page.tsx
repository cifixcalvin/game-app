import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Pencil,
  Plus,
  Search,
  Trophy,
} from "lucide-react";

import { setTournamentStatusAction } from "@/app/admin/tournament-actions";
import { Pagination } from "@/components/pagination";
import {
  GAMES,
  TOURNAMENT_STATUSES,
  TOURNAMENT_STATUS_LABELS,
} from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/authz";
import { listTournaments } from "@/lib/tournaments";
import {
  buildQuery,
  cn,
  formatCurrency,
  formatDate,
  formatNumber,
  tournamentStatusStyle,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tournaments",
};

const TABS = ["all", ...TOURNAMENT_STATUSES] as const;

export default async function AdminTournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    game?: string;
    q?: string;
    page?: string;
    saved?: string;
    deleted?: string;
    updated?: string;
    error?: string;
  }>;
}) {
  const user = await requireAdmin("tournament:view");
  const params = await searchParams;
  const status = (TABS as readonly string[]).includes(params.status ?? "")
    ? (params.status as (typeof TABS)[number])
    : "all";
  const game = GAMES.find((item) => item.id === params.game)?.id ?? "all";
  const search = params.q?.trim().slice(0, 80) ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const result = await listTournaments({
    scope: "admin",
    status,
    game,
    search,
    page,
    pageSize: 15,
    sort: "newest",
  });

  const queryParams = { status, game, q: search || undefined };
  const canPublish = can(user.role, "tournament:publish");
  const flash =
    params.saved
      ? { tone: "success", message: "Tournament saved." }
      : params.deleted
        ? { tone: "success", message: "Tournament deleted." }
        : params.updated
          ? { tone: "success", message: `Status updated to ${params.updated}.` }
          : params.error
            ? {
                tone: "error",
                message:
                  params.error === "forbidden"
                    ? "You do not have permission to perform that action."
                    : "Something went wrong.",
              }
            : null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mono text-[9px] tracking-[0.18em] text-[#b6ff2e]/70 uppercase">
            Bracket control
          </p>
          <h1 className="display mt-2 text-[30px] font-semibold tracking-tight text-white sm:text-[36px]">
            Tournaments
          </h1>
          <p className="mt-1 text-[13px] text-white/35">
            {formatNumber(result.total)} events in the system.
          </p>
        </div>
        <Link href="/admin/tournaments/new" className="btn-primary h-10 px-4 text-[9px]">
          <Plus className="h-3.5 w-3.5" />
          New tournament
        </Link>
      </div>

      {flash ? (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-3 text-[12px]",
            flash.tone === "success"
              ? "border-[#b6ff2e]/25 bg-[#b6ff2e]/[0.06] text-[#d7ff8a]"
              : "border-red-400/25 bg-red-500/10 text-red-200",
          )}
        >
          <Check className="h-3.5 w-3.5" />
          {flash.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-b border-white/[0.07] pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab}
              href={`/admin/tournaments${buildQuery(
                { game, q: search || undefined },
                { status: tab },
              )}`}
              className={cn(
                "mono rounded-md border px-3 py-1.5 text-[9px] tracking-[0.1em] uppercase transition-colors",
                status === tab
                  ? "border-[#b6ff2e]/40 bg-[#b6ff2e]/10 text-[#d7ff8a]"
                  : "border-transparent text-white/35 hover:bg-white/[0.03] hover:text-white/70",
              )}
            >
              {tab === "all" ? "All" : TOURNAMENT_STATUS_LABELS[tab]}
            </Link>
          ))}
        </div>

        <form action="/admin/tournaments" className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search events"
              className="field h-9 w-full pl-9 text-[12px] sm:w-52"
            />
          </label>
          <select
            name="game"
            defaultValue={game}
            className="field h-9 text-[12px]"
            aria-label="Filter by game"
          >
            <option value="all">All titles</option>
            {GAMES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input type="hidden" name="status" value={status} />
          <button type="submit" className="btn-secondary h-9 px-4 text-[9px]">
            Filter
          </button>
        </form>
      </div>

      {result.items.length ? (
        <>
          <div className="surface hidden overflow-hidden rounded-xl md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["Event", "Status", "Starts", "Prize pool", "Slots", ""].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="mono px-4 py-3 text-[8px] font-medium tracking-[0.14em] text-white/25 uppercase last:text-right"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.055]">
                {result.items.map((tournament) => (
                  <tr
                    key={tournament.id}
                    className="transition-colors hover:bg-white/[0.018]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-16 shrink-0 overflow-hidden rounded-md border border-white/10">
                          <img
                            src={tournament.bannerUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/tournaments/${tournament.id}`}
                            className="block max-w-[260px] truncate text-[13px] font-medium text-white hover:text-[#d7ff8a]"
                          >
                            {tournament.title}
                          </Link>
                          <p className="mono mt-1 truncate text-[8px] tracking-[0.06em] text-white/25">
                            /{tournament.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "chip py-0.5 text-[8px]",
                          tournamentStatusStyle(tournament.status),
                        )}
                      >
                        {TOURNAMENT_STATUS_LABELS[tournament.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] text-white/60">
                        {formatDate(tournament.startAt)}
                      </p>
                      <p className="mono mt-0.5 text-[8px] text-white/25">
                        {tournament.game.toUpperCase()}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#d7ff8a]">
                      {formatCurrency(tournament.prizePool, tournament.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="mono text-[11px] text-white/60">
                        {tournament.registeredTeams}/{tournament.maxSlots}
                      </p>
                      <div className="mt-1.5 h-1 w-16 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full bg-[#b6ff2e]/60"
                          style={{
                            width: `${Math.min(100, (tournament.registeredTeams / tournament.maxSlots) * 100)}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canPublish && tournament.status === "draft" ? (
                          <form action={setTournamentStatusAction}>
                            <input type="hidden" name="id" value={tournament.id} />
                            <input type="hidden" name="status" value="published" />
                            <input
                              type="hidden"
                              name="returnTo"
                              value="/admin/tournaments"
                            />
                            <button
                              type="submit"
                              className="mono rounded-md border border-[#b6ff2e]/25 px-2.5 py-1.5 text-[8px] tracking-[0.08em] text-[#d7ff8a] uppercase hover:bg-[#b6ff2e]/10"
                            >
                              Publish
                            </button>
                          </form>
                        ) : null}
                        <Link
                          href={`/tournaments/${tournament.slug}`}
                          target="_blank"
                          aria-label="View live event"
                          className="grid h-8 w-8 place-items-center rounded-md text-white/25 hover:bg-white/5 hover:text-white"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/tournaments/${tournament.id}`}
                          aria-label="Edit tournament"
                          className="grid h-8 w-8 place-items-center rounded-md text-white/25 hover:bg-white/5 hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {result.items.map((tournament) => (
              <div key={tournament.id} className="surface rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-white/10">
                    <img
                      src={tournament.bannerUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/tournaments/${tournament.id}`}
                      className="block truncate text-[13px] font-medium text-white"
                    >
                      {tournament.title}
                    </Link>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={cn(
                          "chip py-0.5 text-[7px]",
                          tournamentStatusStyle(tournament.status),
                        )}
                      >
                        {TOURNAMENT_STATUS_LABELS[tournament.status]}
                      </span>
                      <span className="mono text-[8px] text-white/25">
                        {formatDate(tournament.startAt, false)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3">
                  <div>
                    <p className="mono text-[7px] text-white/25 uppercase">Prize</p>
                    <p className="mt-0.5 text-[12px] text-[#d7ff8a]">
                      {formatCurrency(tournament.prizePool, tournament.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="mono text-[7px] text-white/25 uppercase">Slots</p>
                    <p className="mono mt-0.5 text-[11px] text-white/60">
                      {tournament.registeredTeams}/{tournament.maxSlots}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Link
                    href={`/tournaments/${tournament.slug}`}
                    target="_blank"
                    className="btn-ghost h-8 text-[8px]"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/tournaments/${tournament.id}`}
                    className="btn-secondary h-8 px-3 text-[8px]"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            path="/admin/tournaments"
            params={queryParams}
          />
        </>
      ) : (
        <div className="surface rounded-xl px-6 py-20 text-center">
          <Trophy className="mx-auto h-7 w-7 text-white/15" />
          <h2 className="display mt-4 text-xl font-semibold text-white">
            No tournaments found
          </h2>
          <p className="mt-2 text-[12px] text-white/35">
            Adjust the filters or create a new bracket.
          </p>
          <Link href="/admin/tournaments/new" className="btn-primary mt-5">
            <Plus className="h-3.5 w-3.5" />
            New tournament
          </Link>
        </div>
      )}
    </div>
  );
}
