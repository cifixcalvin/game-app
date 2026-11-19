"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  registerTeam,
  type RegistrationState,
} from "@/app/actions/registration";
import { formatCurrency } from "@/lib/utils";

const initialState: RegistrationState = { ok: false };

export function RegistrationForm({
  tournamentId,
  token,
  entryFee,
  currency,
  teamSize,
  slotsLeft,
}: {
  tournamentId: string;
  token: string;
  entryFee: number;
  currency: string;
  teamSize: number;
  slotsLeft: number;
}) {
  const [state, formAction, pending] = useActionState(registerTeam, initialState);

  if (state.ok && state.reference) {
    return (
      <div className="rounded-2xl border border-[#b6ff2e]/25 bg-[#b6ff2e]/[0.045] p-6 sm:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-[#b6ff2e]/35 bg-[#b6ff2e]/10">
          <CheckCircle2 className="h-6 w-6 text-[#b6ff2e]" />
        </div>
        <h3 className="display mt-5 text-2xl font-semibold text-white">
          Slot request received.
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-white/50">
          {state.teamName ? (
            <>
              <span className="text-white">{state.teamName}</span> is in the
              queue.{" "}
            </>
          ) : null}
          Our team verifies entries and confirms slots on WhatsApp. Save your
          reference below.
        </p>
        <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-5">
          <p className="mono text-[9px] tracking-[0.18em] text-white/30 uppercase">
            Registration reference
          </p>
          <p className="mono mt-2 text-2xl font-semibold tracking-[0.08em] text-[#d7ff8a]">
            {state.reference}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href="/tournaments" className="btn-secondary">
            Back to tournaments
          </Link>
          <Link href="/contact" className="btn-ghost">
            Need help?
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="token" value={token} />
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="teamName" className="label">
          Team name
        </label>
        <input
          id="teamName"
          name="teamName"
          required
          minLength={2}
          maxLength={40}
          placeholder="e.g. Phantom Protocol"
          className="field-lg"
          autoComplete="organization"
        />
        <FieldError errors={state.errors?.teamName} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contactName" className="label">
            Captain name
          </label>
          <input
            id="contactName"
            name="contactName"
            required
            minLength={2}
            maxLength={60}
            placeholder="Full name"
            className="field-lg"
            autoComplete="name"
          />
          <FieldError errors={state.errors?.contactName} />
        </div>
        <div>
          <label htmlFor="whatsapp" className="label">
            WhatsApp number
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            required
            type="tel"
            inputMode="tel"
            maxLength={20}
            placeholder="+91 98765 43210"
            className="field-lg"
            autoComplete="tel"
          />
          <FieldError errors={state.errors?.whatsapp} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input
          id="email"
          name="email"
          required
          type="email"
          maxLength={120}
          placeholder="captain@team.gg"
          className="field-lg"
          autoComplete="email"
        />
        <FieldError errors={state.errors?.email} />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-black/20 p-4 text-[13px] leading-5 text-white/50">
        <input
          type="checkbox"
          name="acceptRules"
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#b6ff2e]"
        />
        <span>
          I confirm this is a {teamSize}-player squad and we accept the{" "}
          <a href="#rules" className="text-[#b6ff2e] underline-offset-2 hover:underline">
            tournament rules
          </a>
          , eligibility criteria, and fair-play policy.
        </span>
      </label>
      <FieldError errors={state.errors?.acceptRules} />

      {state.message && !state.ok ? (
        <div className="rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
          {state.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mono text-[9px] tracking-[0.15em] text-white/30 uppercase">
            Entry fee
          </p>
          <p className="display mt-1 text-xl font-semibold text-white">
            {entryFee > 0 ? formatCurrency(entryFee, currency) : "Free entry"}
          </p>
          <p className="mono mt-1 text-[8px] tracking-[0.12em] text-white/25 uppercase">
            {slotsLeft} slots remaining
          </p>
        </div>
        <button type="submit" disabled={pending} className="btn-primary h-12 px-6">
          {pending ? (
            <>
              Locking slot <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Register squad <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-white/30">
        <ShieldCheck className="h-3.5 w-3.5 text-[#b6ff2e]/60" />
        No account needed. Slots are verified before brackets lock.
      </p>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-300">
      <Check className="hidden" />
      {errors[0]}
    </p>
  );
}
