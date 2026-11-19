import type { Metadata } from "next";
import { ShieldCheck, UserCog, Users } from "lucide-react";

import { TeamManager } from "./team-manager";
import { requireAdmin } from "@/lib/auth";
import { listAdminUsers } from "@/lib/admins";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team access",
};

const ERRORS: Record<string, string> = {
  forbidden: "Only super admins can manage team access.",
  self: "You cannot remove your own account.",
  missing: "That account no longer exists.",
  "last-super-admin": "At least one active super admin must remain.",
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const user = await requireAdmin("admin:manage");
  const [members, query] = await Promise.all([
    listAdminUsers(),
    searchParams,
  ]);

  const active = members.filter((member) => member.isActive).length;
  const superAdmins = members.filter(
    (member) => member.role === "super_admin" && member.isActive,
  ).length;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div>
        <p className="mono text-[9px] tracking-[0.18em] text-[#b6ff2e]/70 uppercase">
          Access control
        </p>
        <h1 className="display mt-2 text-[30px] font-semibold tracking-tight text-white sm:text-[36px]">
          Team access
        </h1>
        <p className="mt-1 text-[13px] text-white/35">
          Super admins, admins, and editors. Every action is permission-gated.
        </p>
      </div>

      {query.deleted || query.error ? (
        <div
          className={`rounded-lg border px-4 py-3 text-[12px] ${
            query.error
              ? "border-red-400/25 bg-red-500/10 text-red-200"
              : "border-[#b6ff2e]/25 bg-[#b6ff2e]/[0.06] text-[#d7ff8a]"
          }`}
        >
          {query.error
            ? (ERRORS[query.error] ?? "Something went wrong.")
            : "Team member removed."}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Members", value: members.length, icon: Users },
          { label: "Active", value: active, icon: UserCog },
          { label: "Super admins", value: superAdmins, icon: ShieldCheck },
        ].map((card) => (
          <div key={card.label} className="surface rounded-lg px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="mono text-[7px] tracking-[0.1em] text-white/25 uppercase">
                {card.label}
              </p>
              <card.icon className="h-3.5 w-3.5 text-[#b6ff2e]/40" />
            </div>
            <p className="display mt-1.5 text-[22px] font-semibold text-white tabular-nums">
              {formatNumber(card.value)}
            </p>
          </div>
        ))}
      </div>

      <TeamManager members={members} currentUserId={user.id} />

      <div className="surface rounded-xl p-5">
        <h2 className="mono text-[8px] tracking-[0.14em] text-white/30 uppercase">
          Role capabilities
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            {
              role: "Super Admin",
              detail:
                "Full control, including team access, publishing, and deleting events.",
            },
            {
              role: "Admin",
              detail:
                "Creates, publishes, and deletes tournaments; manages and exports registrations.",
            },
            {
              role: "Editor",
              detail:
                "Creates and edits tournaments and views registrations, but cannot publish.",
            },
          ].map((item) => (
            <div key={item.role} className="rounded-lg border border-white/[0.06] p-3">
              <p className="text-[11px] font-medium text-white/75">{item.role}</p>
              <p className="mt-1 text-[10px] leading-5 text-white/30">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
