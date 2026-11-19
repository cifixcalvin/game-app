import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/logo";
import { getAdminSession } from "@/lib/auth";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organiser login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const next =
    params.next?.startsWith("/admin") && !params.next.startsWith("//")
      ? params.next
      : "/admin";

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden border-r border-white/[0.06] lg:block">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#b6ff2e]/[0.08] blur-[110px]" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo />
          <div>
            <p className="eyebrow">Operations console</p>
            <h1 className="display mt-5 text-[54px] leading-[0.92] font-bold tracking-[-0.04em] text-white xl:text-[66px]">
              Run the
              <br />
              arena from
              <br />
              <span className="neon-text">one screen.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/45">
              Publish brackets, verify squads, and keep every prize pool moving.
              The Nexus control room is built for speed.
            </p>
            <div className="mt-10 grid max-w-md grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.07]">
              {[
                ["12", "Live brackets"],
                ["9.4K", "Players managed"],
                ["<1m", "Avg. slot verification"],
                ["24/7", "Ops coverage"],
              ].map(([value, label]) => (
                <div key={label} className="bg-[#080b08] px-5 py-4">
                  <p className="display text-xl font-semibold text-white">{value}</p>
                  <p className="mono mt-1 text-[8px] tracking-[0.14em] text-white/30 uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="mono text-[9px] tracking-[0.16em] text-white/20 uppercase">
            Nexus Arena · Secure operations environment
          </p>
        </div>
      </div>

      <div className="flex flex-col bg-[#070a07]/70">
        <div className="flex items-center justify-between p-5 sm:p-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/"
            className="mono ml-auto inline-flex items-center gap-1.5 text-[9px] tracking-[0.14em] text-white/35 uppercase transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="mb-7">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-[#b6ff2e]/20 bg-[#b6ff2e]/[0.06]">
                <ShieldCheck className="h-5 w-5 text-[#b6ff2e]" />
              </div>
              <h2 className="display mt-5 text-3xl font-semibold tracking-tight text-white">
                Command centre
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-white/40">
                Sign in with your organiser credentials to continue.
              </p>
            </div>
            <LoginForm next={next} />
          </div>
        </div>
      </div>
    </div>
  );
}
