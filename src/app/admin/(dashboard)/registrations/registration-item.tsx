"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  Check,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  Save,
  Trash2,
} from "lucide-react";

import {
  deleteRegistrationAction,
  updateRegistrationAction,
  type RegistrationActionState,
} from "@/app/admin/registration-actions";
import {
  REGISTRATION_STATUSES,
  REGISTRATION_STATUS_LABELS,
} from "@/lib/constants";
import type { RegistrationWithTournament } from "@/lib/types";
import {
  cn,
  formatCurrency,
  formatDateTime,
  formatRelative,
  registrationStatusStyle,
} from "@/lib/utils";

const initialState: RegistrationActionState = { ok: false };

export function RegistrationItem({
  registration,
  canUpdate,
}: {
  registration: RegistrationWithTournament;
  canUpdate: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateRegistrationAction,
    initialState,
  );

  return (
    <article className="surface rounded-xl p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/tournaments/${registration.tournamentSlug}`}
              target="_blank"
              className="mono inline-flex items-center gap-1 text-[8px] tracking-[0.1em] text-[#b6ff2e]/60 uppercase hover:text-[#b6ff2e]"
            >
              {registration.tournamentTitle}
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
            <span className="mono text-[8px] tracking-[0.08em] text-white/20">
              {registration.reference}
            </span>
          </div>
          <h3 className="display mt-1.5 truncate text-[17px] font-semibold text-white">
            {registration.teamName}
          </h3>
          <p className="mt-0.5 text-[11px] text-white/35">
            {registration.contactName} · registered{" "}
            {formatRelative(registration.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <span
            className={cn(
              "chip py-0.5 text-[8px]",
              registrationStatusStyle(registration.status),
            )}
          >
            {REGISTRATION_STATUS_LABELS[registration.status]}
          </span>
          <span className="mono text-[8px] text-white/20">
            {formatDateTime(registration.createdAt)}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 border-y border-white/[0.06] py-3 sm:grid-cols-3">
        <a
          href={`mailto:${registration.email}`}
          className="flex min-w-0 items-center gap-2 text-[11px] text-white/50 hover:text-white"
        >
          <Mail className="h-3 w-3 shrink-0 text-white/20" />
          <span className="truncate">{registration.email}</span>
        </a>
        <a
          href={`https://wa.me/${registration.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-[11px] text-white/50 hover:text-white"
        >
          <MessageCircle className="h-3 w-3 shrink-0 text-white/20" />
          {registration.whatsapp}
        </a>
        <span className="mono text-[9px] text-white/25">
          {registration.entryFee > 0
            ? `Entry ${formatCurrency(registration.entryFee)}`
            : "Free entry"}
        </span>
      </div>

      {canUpdate ? (
        <form action={formAction} className="mt-3">
          <input type="hidden" name="id" value={registration.id} />
          <div className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
            <select
              name="status"
              defaultValue={registration.status}
              className="field h-9 text-[11px]"
              aria-label="Registration status"
            >
              {REGISTRATION_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {REGISTRATION_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
            <input
              name="notes"
              defaultValue={registration.notes}
              maxLength={500}
              placeholder="Internal note (only visible to your team)"
              className="field h-9 text-[11px]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="btn-secondary h-9 flex-1 px-3 text-[8px] sm:flex-none"
              >
                {pending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                Save
              </button>
            </div>
          </div>
          {state.message ? (
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-[10px]",
                state.ok ? "text-[#b6ff2e]/80" : "text-red-300",
              )}
            >
              {state.ok ? <Check className="h-3 w-3" /> : null}
              {state.message}
            </p>
          ) : null}
        </form>
      ) : registration.notes ? (
        <p className="mt-3 rounded-md bg-white/[0.025] px-3 py-2 text-[10px] text-white/35">
          {registration.notes}
        </p>
      ) : null}

      {canUpdate ? (
        <form
          action={deleteRegistrationAction}
          className="mt-3 flex justify-end"
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Delete the registration for ${registration.teamName}? This cannot be undone.`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={registration.id} />
          <button
            type="submit"
            className="mono inline-flex items-center gap-1 text-[8px] tracking-[0.08em] text-white/20 uppercase hover:text-red-300"
          >
            <Trash2 className="h-3 w-3" /> Delete entry
          </button>
        </form>
      ) : null}
    </article>
  );
}
