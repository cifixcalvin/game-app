import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";

import { TournamentForm } from "../tournament-form";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/authz";
import { getTournamentById } from "@/lib/tournaments";
import { formatDate, formatNumber, toDateTimeLocalIST } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit tournament",
};

export default async function EditTournamentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireAdmin("tournament:view");
  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) notFound();

  const query = await searchParams;

  return (
    <div>
      {query.saved ? (
        <div className="mx-auto mb-5 flex max-w-[1280px] items-center gap-2 rounded-lg border border-[#b6ff2e]/25 bg-[#b6ff2e]/[0.06] px-4 py-3 text-[12px] text-[#d7ff8a]">
          <Check className="h-3.5 w-3.5" />
          Tournament saved. Last updated {formatDate(tournament.updatedAt)} ·{" "}
          {formatNumber(tournament.registeredTeams)} registered teams.
        </div>
      ) : null}

      <TournamentForm
        tournament={tournament}
        canPublish={can(user.role, "tournament:publish")}
        canDelete={can(user.role, "tournament:delete")}
        defaultTimes={{
          registrationDeadline: toDateTimeLocalIST(
            tournament.registrationDeadline,
          ),
          startAt: toDateTimeLocalIST(tournament.startAt),
          endAt: toDateTimeLocalIST(tournament.endAt),
        }}
        defaultContact={{
          name: tournament.contactName,
          email: tournament.contactEmail,
        }}
      />
    </div>
  );
}
