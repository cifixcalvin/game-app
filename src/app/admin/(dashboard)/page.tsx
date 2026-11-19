import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardCheck,
  ClipboardList,
  Download,
  Plus,
  Radio,
  Trophy,
  Users,
} from "lucide-react";

import { GameTag } from "@/components/game-tag";
import { REGISTRATION_STATUS_LABELS } from "@/lib/constants";
import { getRecentRegistrations, getRegistrationStats } from "@/lib/registrations";
import { getAdminTournamentStats, listTournaments } from "@/lib/tournaments";
import {
  cn,
  formatCurrency,
  formatDate,
  formatRelative,
  registrationStatusStyle,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminOverviewPage() {
  const [stats, registrationStats, recent, upcoming] = await Promise.all([
    getAdminTournamentStats(),
    getRegistrationStats(),
    getRecentRegistrations(6),
    listTournaments({ scope: "admin", status: "upcoming", pageSize: 3 }),
  ]);

  const cards = [
    {
      label: "Live events",
      value: stats.live,
      detail: `${stats.published} published`,
      icon: Radio,
      accent: "text-[#b6ff2e]",
    },
    {
      label: "Registrations",
      value: registrationStats.total,
      detail: `${registrationStats.confirmed + registrationStats.checkedIn} confirmed`,
      icon: ClipboardList,
      accent: "text-sky-300",
    },
    {
      label: "Awaiting review",
      value: registrationStats.pending,
      detail: registrationStats.pending ? "Needs action" : "All clear",
      icon: ClipboardCheck,
      accent: registrationStats.pending ? "text-amber-300" : "text-[#b6ff2e]",
    },
    {
      label: "Brackets",
      value: stats.total,
      detail: `${stats.draft} drafts`,
      icon: Trophy,
      accent: "text-violet-300",
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mono text-[9px] tracking-[0.18em] text-[#b6ff2e]/70 uppercase">
            Command centre
          </p>
          <h1 className="display mt-2 text-[32px] leading-tight font-semibold tracking-tight text-white sm:text-[38px]">
            Here&apos;s the state of play.
          </h1>
          <p className="mt-1.5 text-[13px] text-white/35">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/api/admin/registrations/export"
            className="btn-secondary h-10 px-4 text-[9px]"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Link>
          <Link href="/admin/tournaments/new" className="btn-primary h-10 px-4 text-[9px]">
            <Plus className="h-3.5 w-3.5" />
            New tournament
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="surface rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="mono text-[8px] tracking-[0.16em] text-white/30 uppercase">
                {card.label}
              </p>
              <card.icon className={cn("h-4 w-4", card.accent)} />
            </div>
            <p className="display mt-4 text-3xl font-semibold text-white">
              {card.value}
            </p>
            <p className="mono mt-1 text-[9px] tracking-[0.08em] text-white/30">
              {card.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="surface overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div>
              <h2 className="display text-base font-semibold text-white">
                Latest registrations
              </h2>
              <p className="mono mt-0.5 text-[8px] tracking-[0.12em] text-white/25 uppercase">
                Newest first
              </p>
            </div>
            <Link
              href="/admin/registrations"
              className="mono inline-flex items-center gap-1 text-[9px] tracking-[0.1em] text-[#b6ff2e]/80 uppercase hover:text-[#b6ff2e]"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {recent.length ? (
            <div className="divide-y divide-white/[0.055]">
              {recent.map((registration) => (
                <div
                  key={registration.id}
                  className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-white/[0.018] sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13px] font-medium text-white">
                        {registration.teamName}
                      </p>
                      <span
                        className={cn(
                          "chip py-0.5 text-[8px]",
                          registrationStatusStyle(registration.status),
                        )}
                      >
                        {REGISTRATION_STATUS_LABELS[registration.status]}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-white/35">
                      {registration.contactName} · {registration.email}
                    </p>
                    <p className="mono mt-1.5 text-[8px] tracking-[0.08em] text-white/25 uppercase">
                      {registration.tournamentTitle}
                    </p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <p className="mono text-[10px] text-white/55">
                      {registration.reference}
                    </p>
                    <p className="mono mt-1 text-[8px] tracking-[0.08em] text-white/25">
                      {formatRelative(registration.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              <Users className="mx-auto h-6 w-6 text-white/15" />
              <p className="mt-3 text-[13px] text-white/40">
                No registrations yet. Publish an event to get the queue moving.
              </p>
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="surface rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="display text-base font-semibold text-white">
                Next on the board
              </h2>
              <Link
                href="/admin/tournaments"
                className="mono text-[9px] text-white/30 uppercase hover:text-white/70"
              >
                All
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {upcoming.items.length ? (
                upcoming.items.map((tournament) => (
                  <Link
                    key={tournament.id}
                    href={`/admin/tournaments/${tournament.id}`}
                    className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-3 transition-colors hover:border-[#b6ff2e]/25"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-white/10">
                      <img
                        src={tournament.bannerUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-white/85 group-hover:text-white">
                        {tournament.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <GameTag game={tournament.game} />
                        <span className="mono text-[8px] text-white/25">
                          {formatDate(tournament.startAt, false)}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#b6ff2e]" />
                  </Link>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-[12px] text-white/30">
                  No upcoming events scheduled.
                </p>
              )}
            </div>
          </section>

          <section className="surface rounded-xl p-5">
            <h2 className="display text-base font-semibold text-white">
              Prize pool in play
            </h2>
            <p className="display mt-3 text-2xl font-semibold text-[#d7ff8a]">
              {formatCurrency(
                upcoming.items.reduce((sum, item) => sum + item.prizePool, 0),
              )}
            </p>
            <p className="mono mt-1 text-[8px] tracking-[0.12em] text-white/25 uppercase">
              Across the next {upcoming.items.length} upcoming events
            </p>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[62%] rounded-full bg-[#b6ff2e]/70" />
            </div>
            <Link
              href="/admin/registrations?status=pending"
              className="mt-5 flex items-center justify-between rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3.5 py-3 transition-colors hover:bg-amber-400/[0.1]"
            >
              <div>
                <p className="text-[11px] font-medium text-amber-100">
                  {registrationStats.pending} entries pending
                </p>
                <p className="mono mt-0.5 text-[8px] text-amber-200/50 uppercase">
                  Review &amp; confirm
                </p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-amber-200/60" />
            </Link>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-white/[0.06] bg-white/[0.015] px-5 py-3.5">
        <span className="mono flex items-center gap-2 text-[8px] tracking-[0.12em] text-white/30 uppercase">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#b6ff2e]" />
          Systems nominal
        </span>
        <span className="mono text-[8px] tracking-[0.1em] text-white/20 uppercase">
          {stats.teams} confirmed squads
        </span>
        <span className="mono text-[8px] tracking-[0.1em] text-white/20 uppercase">
          {registrationStats.waitlisted} waitlisted
        </span>
        <span className="mono ml-auto text-[8px] tracking-[0.1em] text-white/20 uppercase">
          Database · {process.env.DATABASE_URL ? "Neon" : "PGlite local"}
        </span>
      </div>
    </div>
  );
}
