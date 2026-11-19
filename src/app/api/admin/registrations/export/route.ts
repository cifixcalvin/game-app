import { requireApiAdmin } from "@/lib/auth";
import { REGISTRATION_STATUSES } from "@/lib/constants";
import { getRegistrationsForExport } from "@/lib/registrations";
import { escapeCsv } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireApiAdmin("registration:export");
  if (!user) {
    return new Response("Unauthorised", { status: 401 });
  }

  const url = new URL(request.url);
  const tournamentId = url.searchParams.get("tournamentId") ?? undefined;
  const rawStatus = url.searchParams.get("status") ?? undefined;
  const status =
    rawStatus && (REGISTRATION_STATUSES as readonly string[]).includes(rawStatus)
      ? (rawStatus as (typeof REGISTRATION_STATUSES)[number])
      : undefined;
  const search = url.searchParams.get("search")?.slice(0, 80) ?? undefined;

  const rows = await getRegistrationsForExport({
    tournamentId,
    status,
    search,
    pageSize: 10000,
  });

  const header = [
    "Reference",
    "Tournament",
    "Game",
    "Team",
    "Captain",
    "Email",
    "WhatsApp",
    "Status",
    "Notes",
    "Registered at",
  ];

  const lines = [
    header.map(escapeCsv).join(","),
    ...rows.map((row) =>
      [
        row.reference,
        row.tournamentTitle,
        row.game,
        row.teamName,
        row.contactName,
        row.email,
        row.whatsapp,
        row.status,
        row.notes,
        row.createdAt,
      ]
        .map(escapeCsv)
        .join(","),
    ),
  ];

  const date = new Date().toISOString().slice(0, 10);
  return new Response(`\uFEFF${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nexus-registrations-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
