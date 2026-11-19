import type { Metadata } from "next";
import { CalendarDays, Mail, ShieldCheck } from "lucide-react";

import { ChangePasswordForm } from "./change-password-form";
import { getAdminUser } from "@/lib/admins";
import { requireSession } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const session = await requireSession();
  const account = await getAdminUser(session.id);

  return (
    <div className="mx-auto max-w-[980px] space-y-6">
      <div>
        <p className="mono text-[9px] tracking-[0.18em] text-[#b6ff2e]/70 uppercase">
          Operator profile
        </p>
        <h1 className="display mt-2 text-[30px] font-semibold tracking-tight text-white sm:text-[36px]">
          Account
        </h1>
        <p className="mt-1 text-[13px] text-white/35">
          Your identity and credentials for the admin console.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
        <section className="surface h-fit rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-[#b6ff2e]/25 bg-[#b6ff2e]/[0.08]">
              <span className="display text-xl font-semibold text-[#d7ff8a]">
                {session.name.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-[17px] font-medium text-white">
                {session.name}
              </h2>
              <span className="mono mt-1 inline-flex items-center gap-1 rounded border border-[#b6ff2e]/25 bg-[#b6ff2e]/[0.07] px-1.5 py-0.5 text-[7px] tracking-[0.08em] text-[#d7ff8a] uppercase">
                <ShieldCheck className="h-2.5 w-2.5" />
                {ROLE_LABELS[session.role]}
              </span>
            </div>
          </div>

          <dl className="mt-6 space-y-3 border-t border-white/[0.07] pt-5">
            <div className="flex items-center gap-2.5">
              <Mail className="h-3.5 w-3.5 text-white/20" />
              <div className="min-w-0">
                <dt className="mono text-[7px] tracking-[0.1em] text-white/20 uppercase">
                  Email
                </dt>
                <dd className="truncate text-[12px] text-white/65">
                  {session.email}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <CalendarDays className="h-3.5 w-3.5 text-white/20" />
              <div>
                <dt className="mono text-[7px] tracking-[0.1em] text-white/20 uppercase">
                  Account created
                </dt>
                <dd className="text-[12px] text-white/65">
                  {account ? formatDate(account.createdAt) : "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-3.5 w-3.5 text-white/20" />
              <div>
                <dt className="mono text-[7px] tracking-[0.1em] text-white/20 uppercase">
                  Last sign in
                </dt>
                <dd className="text-[12px] text-white/65">
                  {account?.lastLoginAt
                    ? `${formatDate(account.lastLoginAt)} · ${formatRelative(account.lastLoginAt)}`
                    : "Current session"}
                </dd>
              </div>
            </div>
          </dl>
        </section>

        <section className="surface rounded-xl p-6">
          <h2 className="display text-sm font-semibold text-white">
            Change password
          </h2>
          <p className="mt-1 text-[10px] leading-5 text-white/30">
            Choose a strong, unique passphrase. You will stay signed in on this
            device.
          </p>
          <div className="mt-5">
            <ChangePasswordForm />
          </div>
        </section>
      </div>
    </div>
  );
}
