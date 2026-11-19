import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";

import { deleteTournamentAction } from "@/app/admin/tournament-actions";
import { requireAdmin } from "@/lib/auth";
import { getTournamentById } from "@/lib/tournaments";
import { formatDate, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Delete tournament",
};

export default async function DeleteTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("tournament:delete");
  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) notFound();

  return (
    <div className="mx-auto max-w-lg py-10">
      <Link
        href={`/admin/tournaments/${tournament.id}`}
        className="mono inline-flex items-center gap-1.5 text-[8px] tracking-[0.14em] text-white/25 uppercase hover:text-white/60"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to editor
      </Link>

      <div className="mt-5 rounded-xl border border-red-400/20 bg-[#170b0b]/60 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10">
          <AlertTriangle className="h-5 w-5 text-red-300" />
        </div>
        <h1 className="display mt-4 text-2xl font-semibold text-white">
          Delete this tournament?
        </h1>
        <p className="mt-2 text-[13px] leading-6 text-white/45">
          You are about to permanently delete{" "}
          <span className="font-medium text-white">{tournament.title}</span>. This
          also removes{" "}
          <span className="text-red-200">
            {formatNumber(tournament.registeredTeams)} team registrations
          </span>{" "}
          and cannot be undone.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg border border-white/[0.07] bg-black/20 p-4">
          <div>
            <p className="mono text-[7px] tracking-[0.12em] text-white/25 uppercase">
              Starts
            </p>
            <p className="mt-1 text-[12px] text-white/60">
              {formatDate(tournament.startAt)}
            </p>
          </div>
          <div>
            <p className="mono text-[7px] tracking-[0.12em] text-white/25 uppercase">
              Prize pool
            </p>
            <p className="mt-1 text-[12px] text-white/60">
              {tournament.currency} {formatNumber(tournament.prizePool)}
            </p>
          </div>
        </div>

        <form action={deleteTournamentAction} className="mt-6">
          <input type="hidden" name="id" value={tournament.id} />
          <input
            type="hidden"
            name="returnTo"
            value="/admin/tournaments?deleted=1"
          />
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <button type="submit" className="btn-danger h-10 flex-1 text-[9px]">
              <Trash2 className="h-3.5 w-3.5" />
              Delete permanently
            </button>
            <Link
              href={`/admin/tournaments/${tournament.id}`}
              className="btn-secondary h-10 flex-1 text-[9px]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
