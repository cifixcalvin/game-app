"use client";

import { useActionState, useEffect, useRef } from "react";
import { Check, KeyRound, Loader2, ShieldCheck } from "lucide-react";

import {
  changePasswordAction,
  type PasswordState,
} from "@/app/admin/auth-actions";
import { cn } from "@/lib/utils";

const initialState: PasswordState = { ok: false };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <span className="label">Current password</span>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="field-lg"
        />
        <FieldError errors={state.errors?.currentPassword} />
      </div>
      <div>
        <span className="label">New password</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field-lg"
        />
        <p className="mono mt-1.5 text-[8px] tracking-[0.04em] text-white/22">
          At least 8 characters. Use a passphrase you do not reuse elsewhere.
        </p>
        <FieldError errors={state.errors?.newPassword} />
      </div>
      <div>
        <span className="label">Confirm new password</span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field-lg"
        />
        <FieldError errors={state.errors?.confirmPassword} />
      </div>

      {state.message ? (
        <p
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-2 text-[11px]",
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
            Updating <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </>
        ) : (
          <>
            <KeyRound className="h-3.5 w-3.5" /> Update password
          </>
        )}
      </button>

      <p className="flex items-start gap-2 text-[10px] leading-5 text-white/25">
        <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-[#b6ff2e]/40" />
        Updating your password signs out every other active admin session.
      </p>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-[10px] text-red-300">{errors[0]}</p>;
}
