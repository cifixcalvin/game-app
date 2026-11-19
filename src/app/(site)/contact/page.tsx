import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Rocket,
  Users,
} from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the Nexus Arena team about tournaments, partnerships, support, or hosting your own event.",
};

const CHANNELS = [
  {
    icon: Mail,
    label: "Player support",
    value: SITE.supportEmail,
    href: `mailto:${SITE.supportEmail}`,
    detail: "Registration issues, roster changes, and prize verification.",
  },
  {
    icon: MessageCircle,
    label: "Community",
    value: "discord.gg/nexusarena",
    href: SITE.socials.discord,
    detail: "The fastest place to reach organisers during a live event.",
  },
  {
    icon: Phone,
    label: "Event desk",
    value: SITE.phone,
    href: `tel:${SITE.phone.replace(/\s/g, "")}`,
    detail: "Match-day escalations, 10:00–23:00 IST.",
  },
  {
    icon: MapPin,
    label: "Studio",
    value: SITE.address,
    href: "https://maps.google.com/?q=Indiranagar+Bengaluru",
    detail: "By appointment for partners and broadcast crews.",
  },
];

const HOST_STEPS = [
  {
    icon: CalendarClock,
    title: "Tell us the window",
    body: "Share your target dates, title, region, and expected team count.",
  },
  {
    icon: Users,
    title: "We scope the bracket",
    body: "Format, seeding, broadcast needs, and a realistic prize structure.",
  },
  {
    icon: Rocket,
    title: "Launch on Nexus",
    body: "Registration, comms, and results run on our tournament engine.",
  },
];

export default function ContactPage() {
  return (
    <div className="pb-24">
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(182,255,46,0.1),transparent_42%)]" />
        <div className="container-shell relative py-20 sm:py-24">
          <p className="eyebrow">Contact</p>
          <h1 className="display mt-4 max-w-2xl text-[44px] leading-[0.98] font-semibold tracking-[-0.03em] text-white sm:text-[60px]">
            Get the right people{" "}
            <span className="text-[#b6ff2e]">on comms.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/45">
            Player issue, partnership pitch, or a bracket you want to host — pick
            a channel and we will route it to the right desk.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`mailto:${SITE.supportEmail}`} className="btn-primary">
              Email support <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href={SITE.socials.discord}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              Join the Discord
            </a>
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
              className="surface group rounded-xl p-6 transition-colors hover:border-[#b6ff2e]/25"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.02]">
                  <channel.icon className="h-4 w-4 text-[#b6ff2e]/80" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/15 transition-colors group-hover:text-[#b6ff2e]" />
              </div>
              <p className="mono mt-5 text-[8px] tracking-[0.14em] text-white/25 uppercase">
                {channel.label}
              </p>
              <p className="mt-1 text-[15px] font-medium text-white">
                {channel.value}
              </p>
              <p className="mt-2 text-[12px] leading-5 text-white/35">
                {channel.detail}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section
        id="organisers"
        className="scroll-mt-24 border-y border-white/[0.06] bg-[#070a07]"
      >
        <div className="container-shell py-20">
          <SectionHeading
            eyebrow="Host with us"
            title={
              <>
                Run your event on{" "}
                <span className="text-[#b6ff2e]">Nexus rails.</span>
              </>
            }
            description="From creator cups to corporate leagues, our team can handle registration, seeding, comms, and results while you focus on the show."
            action={
              <a
                href={`mailto:${SITE.email}?subject=Hosting%20an%20event%20on%20Nexus%20Arena`}
                className="btn-primary"
              >
                Start a brief <ArrowRight className="h-4 w-4" />
              </a>
            }
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {HOST_STEPS.map((step, index) => (
              <div key={step.title} className="surface rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <step.icon className="h-4 w-4 text-[#b6ff2e]/70" />
                  <span className="mono text-[8px] tracking-[0.14em] text-white/20">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="display mt-5 text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-[12px] leading-6 text-white/35">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col justify-between gap-4 rounded-xl border border-white/[0.07] px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[13px] font-medium text-white">
                Prefer a direct line?
              </p>
              <p className="mt-1 text-[11px] text-white/35">
                Partnerships and press: {SITE.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/tournaments" className="btn-secondary h-9 text-[8px]">
                See live events
              </Link>
              <a
                href={`mailto:${SITE.email}`}
                className="btn-primary h-9 text-[8px]"
              >
                Email the team
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
