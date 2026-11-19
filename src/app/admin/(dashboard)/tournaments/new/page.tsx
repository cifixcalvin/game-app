import type { Metadata } from "next";

import { TournamentForm } from "../tournament-form";
import { requireAdmin } from "@/lib/auth";
import { can } from "@/lib/authz";
import { toDateTimeLocalIST } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New tournament",
};

function inDays(days: number, hour = 18) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return toDateTimeLocalIST(date);
}

export default async function NewTournamentPage() {
  const user = await requireAdmin("tournament:create");

  return (
    <TournamentForm
      tournament={null}
      canPublish={can(user.role, "tournament:publish")}
      canDelete={false}
      defaultTimes={{
        registrationDeadline: inDays(10),
        startAt: inDays(14),
        endAt: inDays(16, 22),
      }}
      defaultContact={{ name: user.name, email: user.email }}
    />
  );
}
