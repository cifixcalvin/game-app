import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  Download,
  Inbox,
  ListChecks,
  Search,
  ShieldX,
  Users,
} from "lucide-react";

import { RegistrationItem } from "./registration-item";
import { Pagination } from "@/components/pagination";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/authz";
import {
  REGISTRATION_STATUSES,
  REGISTRATION_STATUS_LABELS,
  type RegistrationStatus,
} from "@/lib/constants";
import {
  getRegistrationStats,
  listRegistrations,
} from "@/lib/registrations";
import { listTournaments } from "@/lib/tournaments";
import { buildQuery, cn, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Registrations",
};

const TABS = ["all", ...REGISTRATION_STATUSES] as const;

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tournamentId?: string;
    status?: string;
    q?: string;
    page?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const user = await requireAdmin("registration:view");
  const params = await searchParams;
  const status = (TABS as readonly string[]).includes(params.status ?? "")
    ? (params.status as (typeof TABS)[number])
    : "all";
  const tournamentId = /^\d+$/.test(params.tournamentId ?? "")
    ? params.tournamentId!
    : "all";
  const search = params.q?.trim().slice(0, 80) ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const scopedTournamentId = tournamentId === "all" ? undefined : tournamentId;

  const [result, stats, tournaments] = await Promise.all([
    listRegistrations({
      tournamentId: scopedTournamentId,
      status: status as RegistrationStatus | "all",
      search,
      page,
      pageSize: 20,
    }),
    getRegistrationStats(scopedTournamentId),
    listTournaments({ scope: "admin", status: "all", pageSize: 100 }),
  ]);

  const canUpdate = can(user.role, "registration:update");
  const queryParams = {
    tournamentId,
    q: search || undefined,
  };
  const exportQuery = buildQuery(
    { tournamentId, status, q: search || undefined },
    {},
  );

  const statCards = [
    {
      label: "Total entries",
      value: stats.total,
      icon: Inbox,
      tone: "text-white",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock3,
      tone: "text-amber-300",
    },
    {
      label: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle2,
      tone: "text-[#d7ff8a]",
    },
    {
      label: "Checked in",
      value: stats.checkedIn,
      icon: ListChecks,
      tone: "text-sky-300",
    },
    {
      label: "Waitlisted",
      value: stats.waitlisted,
      icon: Users,
      tone: "text-purple-300",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: ShieldX,
      tone: "text-red-300",
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mono text-[9px] tracking-[0.18em] text-[#b6ff2e]/70 uppercase">
            Team intake
          </p>
          <h1 className="display mt-2 text-[30px] font-semibold tracking-tight text-white sm:text-[36px]">
            Registrations
          </h1>
          <p className="mt-1 text-[13px] text-white/35">
            Review, confirm, and export every team entry.
          </p>
        </div>
        <a
          href={`/api/admin/registrations/export${exportQuery}`}
          className={cn(
            "btn-secondary h-10 px-4 text-[9px]",
            stats.total === 0 && "pointer-events-none opacity-40",
          )}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </a>
      </div>

      {params.deleted || params.error ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-[12px]",
            params.error
              ? "border-red-400/25 bg-red-500/10 text-red-200"
              : "border-[#b6ff2e]/25 bg-[#b6ff2e]/[0.06] text-[#d7ff8a]",
          )}
        >
          {params.error
            ? "You do not have permission to perform that action."
            : "Registration deleted."}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.label} className="surface rounded-lg px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="mono text-[7px] tracking-[0.1em] text-white/25 uppercase">
                {card.label}
              </p>
              <card.icon className={cn("h-3.5 w-3.5", card.tone, "opacity-60")} />
            </div>
            <p
              className={cn(
                "display mt-1.5 text-[22px] font-semibold tabular-nums",
                card.tone,
              )}
            >
              {formatNumber(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-b border-white/[0.07] pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab}
              href={`/admin/registrations${buildQuery(
                { tournamentId, q: search || undefined },
                { status: tab },
              )}`}
              className={cn(
                "mono rounded-md border px-3 py-1.5 text-[9px] tracking-[0.1em] uppercase transition-colors",
                status === tab
                  ? "border-[#b6ff2e]/40 bg-[#b6ff2e]/10 text-[#d7ff8a]"
                  : "border-transparent text-white/35 hover:bg-white/[0.03] hover:text-white/70",
              )}
            >
              {tab === "all" ? "All" : REGISTRATION_STATUS_LABELS[tab]}
            </Link>
          ))}
        </div>

        <form
          action="/admin/registrations"
          className="flex flex-col gap-2 sm:flex-row"
        >
          <select
            name="tournamentId"
            defaultValue={tournamentId}
            className="field h-9 max-w-full text-[11px] sm:w-56"
            aria-label="Filter by tournament"
          >
            <option value="all">All tournaments</option>
            {tournaments.items.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.title}
              </option>
            ))}
          </select>
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Team, email, ref"
              className="field h-9 w-full pl-9 text-[12px] sm:w-48"
            />
          </label>
          <input type="hidden" name="status" value={status} />
          <button type="submit" className="btn-secondary h-9 px-4 text-[9px]">
            Filter
          </button>
        </form>
      </div>

      {result.items.length ? (
        <>
          <div className="space-y-3">
            {result.items.map((registration) => (
              <RegistrationItem
                key={registration.id}
                registration={registration}
                canUpdate={canUpdate}
              />
            ))}
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            path="/admin/registrations"
            params={{ ...queryParams, status }}
          />
        </>
      ) : (
        <div className="surface rounded-xl px-6 py-20 text-center">
          <Inbox className="mx-auto h-7 w-7 text-white/15" />
          <h2 className="display mt-4 text-xl font-semibold text-white">
            No registrations here
          </h2>
          <p className="mt-2 text-[12px] text-white/35">
            {search || tournamentId !== "all" || status !== "all"
              ? "No teams match these filters."
              : "Team entries will appear here as soon as they register."}
          </p>
        </div>
      )}
    </div>
  );
}
