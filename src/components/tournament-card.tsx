import Link from "next/link";
import { ArrowUpRight, CalendarDays, Users } from "lucide-react";

import { getGame } from "@/lib/constants";
import type { TournamentWithCounts } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  getRegistrationWindow,
  getTournamentPhase,
} from "@/lib/utils";

import { Countdown } from "./countdown";
import { GameTag } from "./game-tag";
import { StatusBadge } from "./status-badge";

export function TournamentCard({
  tournament,
  index = 0,
}: {
  tournament: TournamentWithCounts;
  index?: number;
}) {
  const game = getGame(tournament.game);
  const phase = getTournamentPhase(tournament);
  const window = getRegistrationWindow(tournament);
  const fill = Math.min(
    100,
    Math.round((tournament.registeredTeams / tournament.maxSlots) * 100),
  );

  return (
    <Link
      href={`/tournaments/${tournament.slug}`}
      className="surface surface-hover group card-cut animate-rise relative flex flex-col overflow-hidden"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <div className="relative h-[188px] overflow-hidden">
        <img
          src={tournament.bannerUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
          loading={index < 3 ? "eager" : "lazy"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d09] via-[#090d09]/30 to-transparent" />
        <div
          className="absolute inset-0 opacity-55 mix-blend-screen"
          style={{
            background: `radial-gradient(circle at 82% 8%, ${game.tint}, transparent 55%)`,
          }}
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <StatusBadge phase={phase} window={window} />
          {tournament.featured ? (
            <span className="mono rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[9px] tracking-[0.16em] text-white/55 uppercase backdrop-blur">
              Featured
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <GameTag game={tournament.game} />
        <h3 className="display mt-2.5 text-[21px] leading-[1.12] font-semibold tracking-tight text-white transition-colors group-hover:text-[#d7ff8a]">
          {tournament.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-white/42">
          {tournament.tagline}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-white/[0.07] py-3.5">
          <div>
            <p className="mono text-[8px] tracking-[0.16em] text-white/28 uppercase">
              Prize pool
            </p>
            <p className="display mt-1 text-lg font-semibold text-[#d7ff8a]">
              {formatCurrency(tournament.prizePool, tournament.currency)}
            </p>
          </div>
          <div className="border-l border-white/[0.07] pl-3">
            <p className="mono text-[8px] tracking-[0.16em] text-white/28 uppercase">
              Starts
            </p>
            <p className="mt-1 text-sm font-medium text-white/80">
              {formatDate(tournament.startAt)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <Users className="h-3.5 w-3.5 text-white/25" />
            <span className="tabular-nums">
              {tournament.registeredTeams}/{tournament.maxSlots} teams
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <CalendarDays className="h-3.5 w-3.5 text-white/25" />
            <Countdown target={tournament.registrationDeadline} />
          </div>
        </div>

        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[#b6ff2e]/75"
            style={{ width: `${fill}%` }}
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="mono text-[9px] tracking-[0.14em] text-white/28 uppercase">
            {tournament.format}
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/45 transition-all group-hover:border-[#b6ff2e]/50 group-hover:bg-[#b6ff2e] group-hover:text-black">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
