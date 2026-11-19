"use client";

import { useActionState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import {
  subscribeAction,
  type NewsletterState,
} from "@/app/actions/newsletter";

const initialState: NewsletterState = { ok: false };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribeAction,
    initialState,
  );

  return (
    <form action={formAction} className="w-full">
      <div className="relative flex items-center overflow-hidden rounded-full border border-white/12 bg-black/35 focus-within:border-[#b6ff2e]/50">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          aria-label="Email address"
          className="h-12 min-w-0 flex-1 bg-transparent px-5 text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Subscribe to the newsletter"
          className="mr-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#b6ff2e] text-black transition-colors hover:bg-[#c8ff62] disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : state.ok ? (
            <Check className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>
      <p
        className={`mt-3 min-h-4 text-xs ${state.ok ? "text-[#d7ff8a]" : "text-red-300"}`}
        aria-live="polite"
      >
        {state.message}
      </p>
    </form>
  );
}
