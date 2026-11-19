"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  Check,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";

import {
  createAdminAction,
  deleteAdminAction,
  updateAdminAction,
  type TeamActionState,
} from "@/app/admin/admin-actions";
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import type { AdminUser } from "@/lib/types";
import { cn, formatDate, formatRelative } from "@/lib/utils";

const initialState: TeamActionState = { ok: false };

export function TeamManager({
  members,
  currentUserId,
}: {
  members: AdminUser[];
  currentUserId: string;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
      <CreateMemberForm />
      <div className="space-y-3">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isSelf={member.id === currentUserId}
          />
        ))}
      </div>
    </div>
  );
}

function CreateMemberForm() {
  const [state, formAction, pending] = useActionState(
    createAdminAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <section className="surface h-fit rounded-xl p-5 xl:sticky xl:top-24">
      <div className="flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-[#b6ff2e]/70" />
        <h2 className="display text-sm font-semibold text-white">
          Add team member
        </h2>
      </div>
      <p className="mt-1 text-[10px] leading-4 text-white/30">
        Accounts are created with a password you share privately. There is no
        public admin sign-up.
      </p>

      <form ref={formRef} action={formAction} className="mt-4 space-y-3">
        <div>
          <span className="label">Full name</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={60}
            placeholder="Ananya Rao"
            className="field-lg"
          />
          <FieldError errors={state.errors?.name} />
        </div>
        <div>
          <span className="label">Work email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="ananya@nexusarena.gg"
            className="field-lg"
          />
          <FieldError errors={state.errors?.email} />
        </div>
        <div>
          <span className="label">Role</span>
          <select name="role" defaultValue="editor" className="field-lg">
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          <FieldError errors={state.errors?.role} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div>
            <span className="label">Temporary password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="field-lg"
            />
            <FieldError errors={state.errors?.password} />
          </div>
          <div>
            <span className="label">Confirm password</span>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Repeat password"
              className="field-lg"
            />
            <FieldError errors={state.errors?.confirmPassword} />
          </div>
        </div>

        {state.message ? (
          <p
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[10px]",
              state.ok
                ? "bg-[#b6ff2e]/[0.07] text-[#d7ff8a]"
                : "bg-red-500/10 text-red-300",
            )}
          >
            {state.ok ? <Check className="h-3 w-3" /> : null}
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="btn-primary h-10 w-full text-[9px]"
        >
          {pending ? (
            <>
              Creating <Loader2 className="h-3.5 w-3.5 animate-spin" />
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Create account
            </>
          )}
        </button>
      </form>
    </section>
  );
}

function MemberCard({
  member,
  isSelf,
}: {
  member: AdminUser;
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateAdminAction,
    initialState,
  );

  return (
    <article className="surface rounded-xl p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#b6ff2e]/20 bg-[#b6ff2e]/[0.07]">
            <span className="display text-sm font-semibold text-[#d7ff8a]">
              {member.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-white">
              {member.name}
              {isSelf ? (
                <span className="mono ml-2 rounded border border-white/10 px-1.5 py-0.5 text-[7px] tracking-[0.08em] text-white/30 uppercase">
                  You
                </span>
              ) : null}
            </p>
            <p className="truncate text-[11px] text-white/30">{member.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "chip py-0.5 text-[8px]",
              member.role === "super_admin"
                ? "border-[#b6ff2e]/40 bg-[#b6ff2e]/10 text-[#d7ff8a]"
                : member.role === "admin"
                  ? "border-sky-400/25 bg-sky-400/10 text-sky-300"
                  : "border-white/10 bg-white/[0.03] text-white/45",
            )}
          >
            <ShieldCheck className="mr-1 h-2.5 w-2.5" />
            {ROLE_LABELS[member.role]}
          </span>
          <span
            className={cn(
              "mono rounded px-1.5 py-0.5 text-[7px] uppercase",
              member.isActive
                ? "bg-[#b6ff2e]/10 text-[#b6ff2e]/80"
                : "bg-red-500/10 text-red-300",
            )}
          >
            {member.isActive ? "Active" : "Paused"}
          </span>
        </div>
      </div>

      <form action={formAction} className="mt-4 space-y-2">
        <input type="hidden" name="id" value={member.id} />
        <div className="grid gap-2 sm:grid-cols-[1fr_170px]">
          <input
            name="name"
            defaultValue={member.name}
            required
            minLength={2}
            maxLength={60}
            className="field h-9 text-[12px]"
            aria-label="Member name"
          />
          <select
            name="role"
            defaultValue={member.role}
            className="field h-9 text-[11px]"
            aria-label="Member role"
          >
            {ROLES.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {isSelf ? (
              <input type="hidden" name="isActive" value="on" />
            ) : (
              <label className="flex cursor-pointer items-center gap-2 text-[10px] text-white/40">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={member.isActive}
                  className="h-3.5 w-3.5 accent-[#b6ff2e]"
                />
                Account active
              </label>
            )}
            <span className="mono text-[8px] text-white/20">
              Joined {formatDate(member.createdAt, false)}
              {member.lastLoginAt
                ? ` · last seen ${formatRelative(member.lastLoginAt)}`
                : " · never signed in"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isSelf ? (
              <DeleteMemberButton member={member} />
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="btn-secondary h-8 px-3 text-[8px]"
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
              "flex items-center gap-1.5 text-[10px]",
              state.ok ? "text-[#b6ff2e]/80" : "text-red-300",
            )}
          >
            {state.ok ? <Check className="h-3 w-3" /> : null}
            {state.message}
          </p>
        ) : null}
      </form>
    </article>
  );
}

function DeleteMemberButton({ member }: { member: AdminUser }) {
  return (
    <form
      action={deleteAdminAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Remove ${member.name} from the team? They will lose admin access immediately.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={member.id} />
      <button
        type="submit"
        className="mono inline-flex h-8 items-center gap-1 rounded-md px-2 text-[8px] tracking-[0.06em] text-white/20 uppercase hover:text-red-300"
      >
        <Trash2 className="h-3 w-3" /> Remove
      </button>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-[10px] text-red-300">{errors[0]}</p>;
}
