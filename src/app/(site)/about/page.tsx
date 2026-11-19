import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Crosshair,
  Globe2,
  Radio,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nexus Arena is India's premium esports tournament platform, built for players who take competition seriously.",
};

const STATS = [
  { value: "10", label: "Title ecosystems" },
  { value: "4,800+", label: "Teams hosted" },
  { value: "₹42L", label: "Prizes distributed" },
  { value: "6", label: "Host cities" },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Competitive integrity",
    body: "Anti-cheat checks, verified rosters, and transparent rulings. Every bracket is run to a standard worth respecting.",
  },
  {
    icon: Radio,
    title: "Broadcast-grade events",
    body: "Observed lobbies, caster-ready overlays, and production that treats every final like it belongs on a main stage.",
  },
  {
    icon: Globe2,
    title: "Open access",
    body: "From first-time scrims to national finals, we build ladders that give new teams a real path upward.",
  },
];

const TIMELINE = [
  {
    year: "2023",
    title: "The first lobby",
    body: "Nexus Arena launches with a single Valorant open. 96 teams sign up in 48 hours.",
  },
  {
    year: "2024",
    title: "A national circuit",
    body: "BGMI and CS2 seasons launch, with qualifiers across six cities and a live Bengaluru final.",
  },
  {
    year: "2025",
    title: "Organiser platform",
    body: "We open our tournament engine to partner organisers, bringing registration, seeding, and results under one roof.",
  },
  {
    year: "2026",
    title: "Built for the next tier",
    body: "Academy ladders, creator cups, and a unified player identity across every Nexus event.",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-24">
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(182,255,46,0.12),transparent_46%)]" />
        <div className="container-shell relative py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="eyebrow">Our story</p>
              <h1 className="display mt-4 max-w-3xl text-[44px] leading-[0.98] font-semibold tracking-[-0.03em] text-white sm:text-[64px]">
                Built for the moment the{" "}
                <span className="text-[#b6ff2e]">lobby goes quiet.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-7 text-white/45">
                Nexus Arena exists for the seconds before a match starts — when
                preparation meets nerve. We build tournaments that respect the
                grind, the roster, and the result.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/tournaments" className="btn-primary">
                  Find your next bracket <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="btn-secondary">
                  Talk to the team
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              <img
                src="/banners/valorant.svg"
                alt="Nexus Arena event artwork"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050706] via-transparent to-transparent" />
              <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="mono text-[8px] tracking-[0.16em] text-white/40 uppercase">
                  Nexus premiere circuit
                </span>
                <Trophy className="h-4 w-4 text-[#b6ff2e]" />
              </div>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.06] sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-[#070a07] px-5 py-6">
                <p className="display text-[28px] font-semibold text-white">
                  {stat.value}
                </p>
                <p className="mono mt-1 text-[8px] tracking-[0.12em] text-white/30 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell py-20">
        <SectionHeading
          eyebrow="What we stand for"
          title={
            <>
              Serious competition. <span className="text-white/35">Zero noise.</span>
            </>
          }
          description="Three principles shape every bracket we publish, every ruling we make, and every broadcast we ship."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="surface rounded-xl p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-[#b6ff2e]/20 bg-[#b6ff2e]/[0.06]">
                <value.icon className="h-4 w-4 text-[#b6ff2e]" />
              </div>
              <h3 className="display mt-5 text-lg font-semibold text-white">
                {value.title}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-white/40">
                {value.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-[#070a07]">
        <div className="container-shell grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">The road here</p>
            <h2 className="display mt-3 text-[34px] leading-[1.05] font-semibold tracking-tight text-white sm:text-[42px]">
              From one open to a national stage.
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-7 text-white/40">
              We are still early. The plan is simple: raise the floor for
              competitive play in India and keep the ceiling open.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Swords className="h-4 w-4 text-[#b6ff2e]/70" />
              <span className="mono text-[9px] tracking-[0.14em] text-white/35 uppercase">
                Player-first since day one
              </span>
            </div>
          </div>

          <ol className="relative space-y-6 border-l border-white/[0.09] pl-6">
            {TIMELINE.map((item) => (
              <li key={item.year} className="relative">
                <span className="absolute top-1.5 -left-[31px] h-2.5 w-2.5 rounded-full border border-[#b6ff2e]/60 bg-[#050706]" />
                <p className="mono text-[9px] tracking-[0.16em] text-[#b6ff2e]/70">
                  {item.year}
                </p>
                <h3 className="display mt-1 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-1 max-w-lg text-[13px] leading-6 text-white/40">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-shell py-20">
        <div className="relative overflow-hidden rounded-2xl border border-[#b6ff2e]/20 bg-[linear-gradient(120deg,rgba(182,255,46,0.1),rgba(5,7,6,0.2)_55%)] p-8 sm:p-12">
          <Crosshair className="absolute -top-6 -right-6 h-40 w-40 text-[#b6ff2e]/[0.06]" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">Ready when you are</p>
              <h2 className="display mt-3 max-w-xl text-[30px] leading-tight font-semibold tracking-tight text-white sm:text-[38px]">
                Your next roster has a bracket waiting.
              </h2>
              <p className="mt-3 flex items-center gap-2 text-[13px] text-white/40">
                <Users className="h-3.5 w-3.5 text-[#b6ff2e]/60" />
                Free to enter. Open to every eligible team.
              </p>
            </div>
            <Link href="/tournaments" className="btn-primary shrink-0">
              Browse tournaments <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
