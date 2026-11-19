"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";

import { loginAction, type LoginState } from "@/app/admin/auth-actions";

const initialState: LoginState = { ok: false };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="label">
          Work email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@nexusarena.gg"
            className="field-lg pl-11"
          />
        </div>
        {state.errors?.email?.[0] ? (
          <p className="mt-1.5 text-[11px] text-red-300">{state.errors.email[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="field-lg pr-12 pl-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-1/2 right-3 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-white/30 hover:bg-white/5 hover:text-white/70"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {state.errors?.password?.[0] ? (
          <p className="mt-1.5 text-[11px] text-red-300">
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <div
          className="rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-[12px] text-red-200"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary h-12 w-full">
        {pending ? (
          <>
            Authenticating <Loader2 className="h-4 w-4 animate-spin" />
          </>
        ) : (
          "Enter command centre"
        )}
      </button>

      <p className="text-center text-[10px] leading-5 text-white/25">
        Authorised Nexus Arena personnel only. All access is logged and
        rate-limited.
      </p>
    </form>
  );
}
