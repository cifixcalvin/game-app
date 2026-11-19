import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock,
  Gamepad2,
  MapPin,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

import { Countdown } from "@/components/countdown";
import { GameTag } from "@/components/game-tag";
import { RegistrationForm } from "@/components/registration-form";
import { SectionHeading } from "@/components/section-heading";
import { StatusBadge } from "@/components/status-badge";
import { TournamentCard } from "@/components/tournament-card";
import { SITE } from "@/lib/constants";
import { createRegistrationToken } from "@/lib/form-token";
import { getRelatedTournaments, getTournamentBySlug } from "@/lib/tournaments";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  getRegistrationWindow,
  getTournamentPhase,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) return { title: "Tournament not found" };

  return {
    title: tournament.title,
    description: tournament.tagline,
    openGraph: {
      title: tournament.title,
      description: tournament.tagline,
      type: "website",
      images: [{ url: tournament.bannerUrl, alt: tournament.title }],
    },
  };
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);
  if (!tournament) notFound();

  const phase = getTournamentPhase(tournament);
  const registration = getRegistrationWindow(tournament);
  const slotsLeft = Math.max(0, tournament.maxSlots - tournament.registeredTeams);
  const related = await getRelatedTournaments(tournament.game, tournament.slug, 3);
  const canRegister = registration === "open" && slotsLeft > 0;
  const token = canRegister ? createRegistrationToken(tournament.id) : null;
  const sortedSchedule = [...tournament.schedule].sort(
    (a, b) => Date.parse(a.at) - Date.parse(b.at),
  );

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: tournament.title,
    description: tournament.description,
    startDate: tournament.startAt,
    endDate: tournament.endAt,
    eventStatus:
      phase === "cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: `${SITE.url}/tournaments/${tournament.slug}`,
    },
    image: new URL(tournament.bannerUrl, SITE.url).href,
    organizer: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    offers: {
      "@type": "Offer",
      price: tournament.entryFee,
      priceCurrency: tournament.currency,
      availability: canRegister
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      url: `${SITE.url}/tournaments/${tournament.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0">
          <img
            src={tournament.bannerUrl}
            alt=""
            className="h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050706] via-[#050706]/70 to-[#050706]/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050706]/80 via-transparent to-transparent" />
        </div>

        <div className="container-shell relative pt-8 pb-12 sm:pt-10 sm:pb-16">
          <Link
            href="/tournaments"
            className="mono inline-flex items-center gap-2 text-[9px] tracking-[0.16em] text-white/45 uppercase transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All tournaments
          </Link>

          <div className="mt-12 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge phase={phase} window={registration} />
              <GameTag game={tournament.game} showGenre />
            </div>
            <h1 className="display mt-4 text-[40px] leading-[0.98] font-bold tracking-[-0.03em] text-white sm:text-[58px]">
              {tournament.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/55 sm:text-base">
              {tournament.tagline}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Meta icon={CalendarDays}>
                {formatDate(tournament.startAt)} – {formatDate(tournament.endAt)}
              </Meta>
              <Meta icon={MapPin}>{tournament.region}</Meta>
              <Meta icon={Gamepad2}>{tournament.platform}</Meta>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <div className="min-w-0">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">
              <Fact label="Prize pool" value={formatCurrency(tournament.prizePool, tournament.currency)} accent />
              <Fact label="Entry fee" value={tournament.entryFee ? formatCurrency(tournament.entryFee, tournament.currency) : "Free"} />
              <Fact label="Team size" value={`${tournament.teamSize} players`} />
              <Fact label="Format" value={tournament.format} />
            </div>

            <section className="mt-12">
              <h2 className="display text-2xl font-semibold text-white">
                The briefing
              </h2>
              <p className="mt-4 whitespace-pre-line text-[14px] leading-7 text-white/50">
                {tournament.description}
              </p>
            </section>

            <section className="mt-12">
              <div className="flex items-center justify-between gap-4">
                <h2 className="display text-2xl font-semibold text-white">
                  Schedule
                </h2>
                <span className="mono text-[9px] tracking-[0.16em] text-white/25 uppercase">
                  All times IST
                </span>
              </div>
              <div className="mt-5 space-y-0 border-l border-white/[0.09] pl-6">
                {sortedSchedule.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="relative pb-7 last:pb-0">
                    <span className="absolute top-1.5 -left-[30px] h-2 w-2 rounded-full border border-[#b6ff2e]/60 bg-[#0a0e0a]">
                      <span className="absolute inset-[2px] rounded-full bg-[#b6ff2e]" />
                    </span>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="mono shrink-0 text-[10px] tracking-[0.08em] text-[#d7ff8a]/80">
                        {formatDateTime(item.at)}
                      </p>
                    </div>
                    {item.detail ? (
                      <p className="mt-1 text-[12px] leading-5 text-white/35">
                        {item.detail}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            {tournament.prizeBreakdown.length ? (
              <section className="mt-12">
                <h2 className="display text-2xl font-semibold text-white">
                  Prize distribution
                </h2>
                <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.08]">
                  {tournament.prizeBreakdown.map((prize, index) => (
                    <div
                      key={`${prize.place}-${index}`}
                      className="flex items-center justify-between gap-4 border-b border-white/[0.06] bg-white/[0.015] px-5 py-4 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="mono grid h-7 w-7 place-items-center rounded-md border border-white/10 text-[10px] text-white/40">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{prize.place}</p>
                          {prize.note ? (
                            <p className="mt-0.5 text-[11px] text-white/30">{prize.note}</p>
                          ) : null}
                        </div>
                      </div>
                      <p className="display text-lg font-semibold text-[#d7ff8a]">
                        {formatCurrency(prize.amount, tournament.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section id="rules" className="mt-12 scroll-mt-28">
              <h2 className="display text-2xl font-semibold text-white">
                Rules of engagement
              </h2>
              <ol className="mt-5 space-y-3">
                {tournament.rules.map((rule, index) => (
                  <li
                    key={`${rule}-${index}`}
                    className="flex gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3.5"
                  >
                    <span className="mono mt-0.5 text-[10px] text-[#b6ff2e]/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[13px] leading-6 text-white/50">{rule}</span>
                  </li>
                ))}
              </ol>
            </section>

            {tournament.eligibility.length ? (
              <section className="mt-10">
                <h2 className="display text-xl font-semibold text-white">
                  Eligibility
                </h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {tournament.eligibility.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[12px] leading-5 text-white/45"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b6ff2e]/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section id="register" className="mt-14 scroll-mt-28">
              <div className="surface rounded-2xl p-5 sm:p-7">
                <div className="flex flex-col justify-between gap-3 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-end">
                  <div>
                    <p className="eyebrow">Registration</p>
                    <h2 className="display mt-3 text-[28px] leading-tight font-semibold text-white">
                      {canRegister ? "Claim your slot." : "Entry is closed."}
                    </h2>
                  </div>
                  <div className="mono text-[9px] tracking-[0.14em] text-white/30 uppercase">
                    {tournament.registeredTeams}/{tournament.maxSlots} teams in
                  </div>
                </div>

                <div className="pt-6">
                  {canRegister && token ? (
                    <RegistrationForm
                      tournamentId={tournament.id}
                      token={token}
                      entryFee={tournament.entryFee}
                      currency={tournament.currency}
                      teamSize={tournament.teamSize}
                      slotsLeft={slotsLeft}
                    />
                  ) : (
                    <ClosedRegistration
                      phase={phase}
                      registration={registration}
                      deadline={tournament.registrationDeadline}
                      contactEmail={tournament.contactEmail}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="surface rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="mono text-[9px] tracking-[0.18em] text-white/30 uppercase">
                  Event pass
                </p>
                <Trophy className="h-4 w-4 text-[#b6ff2e]/60" />
              </div>
              <p className="display mt-4 text-[34px] leading-none font-semibold text-[#d7ff8a]">
                {formatCurrency(tournament.prizePool, tournament.currency)}
              </p>
              <p className="mt-1 text-[11px] text-white/35">Total prize pool</p>

              <div className="mt-5 space-y-3 border-y border-white/[0.07] py-5">
                <SideRow label="Entry" value={tournament.entryFee ? formatCurrency(tournament.entryFee, tournament.currency) : "Free"} />
                <SideRow label="Team size" value={`${tournament.teamSize} players`} />
                <SideRow label="Region" value={tournament.region} />
                <SideRow label="Platform" value={tournament.platform} />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/40">Slots filled</span>
                  <span className="mono text-white/70">
                    {tournament.registeredTeams}/{tournament.maxSlots}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-[#b6ff2e]"
                    style={{
                      width: `${Math.min(100, (tournament.registeredTeams / tournament.maxSlots) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/[0.07] bg-black/25 p-4">
                {registration === "open" ? (
                  <Countdown
                    target={tournament.registrationDeadline}
                    label="Registration closes"
                  />
                ) : (
                  <>
                    <p className="mono text-[9px] tracking-[0.16em] text-white/30 uppercase">
                      Registration
                    </p>
                    <p className="display mt-1.5 text-base font-semibold text-white">
                      {registration === "full" ? "Slots full" : "Closed"}
                    </p>
                  </>
                )}
              </div>

              {canRegister ? (
                <a href="#register" className="btn-primary mt-5 w-full">
                  Register squad <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <span className="btn mt-5 w-full cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/30">
                  Registration closed
                </span>
              )}

              <div className="mt-5 space-y-2.5 border-t border-white/[0.07] pt-5">
                <p className="flex items-start gap-2 text-[11px] leading-5 text-white/35">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/20" />
                  Starts {formatDate(tournament.startAt)} at{" "}
                  {formatTime(tournament.startAt)} IST
                </p>
                <p className="flex items-start gap-2 text-[11px] leading-5 text-white/35">
                  <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/20" />
                  {tournament.teamSize}-player squads · {tournament.maxSlots} slots
                </p>
                <a
                  href={`mailto:${tournament.contactEmail}`}
                  className="flex items-center gap-1.5 pt-1 text-[11px] text-[#b6ff2e]/75 hover:text-[#b6ff2e]"
                >
                  Event support <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
              <p className="flex items-center gap-2 text-[11px] text-white/35">
                <ShieldCheck className="h-3.5 w-3.5 text-[#b6ff2e]/60" />
                Verified organiser · Secure registration
              </p>
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="border-t border-white/[0.06] py-16">
          <div className="container-shell">
            <SectionHeading
              eyebrow="Stay in the fight"
              title="More from this title"
              action={
                <Link
                  href={`/tournaments?game=${tournament.game}`}
                  className="btn-secondary"
                >
                  View all
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <TournamentCard key={item.id} tournament={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function Meta({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <span className="mono flex items-center gap-2 text-[10px] tracking-[0.1em] text-white/50 uppercase">
      <Icon className="h-3.5 w-3.5 text-[#b6ff2e]/60" />
      {children}
    </span>
  );
}

function Fact({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[#080b08] px-4 py-4 sm:px-5">
      <p className="mono text-[8px] tracking-[0.15em] text-white/28 uppercase">
        {label}
      </p>
      <p
        className={`mt-1.5 text-[13px] font-medium ${accent ? "text-[#d7ff8a]" : "text-white/80"}`}
      >
        {value}
      </p>
    </div>
  );
}

function SideRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px]">
      <span className="text-white/35">{label}</span>
      <span className="text-right text-white/70">{value}</span>
    </div>
  );
}

function ClosedRegistration({
  phase,
  registration,
  deadline,
  contactEmail,
}: {
  phase: ReturnType<typeof getTournamentPhase>;
  registration: ReturnType<typeof getRegistrationWindow>;
  deadline: string;
  contactEmail: string;
}) {
  const title =
    phase === "cancelled"
      ? "This event was cancelled"
      : registration === "full"
        ? "Every slot is taken"
        : phase === "completed"
          ? "This bracket has closed"
          : phase === "live"
            ? "The battle is live"
            : "Registration has closed";

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/20 px-5 py-8 text-center sm:px-8">
      <ShieldCheck className="mx-auto h-7 w-7 text-white/20" />
      <h3 className="display mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-white/40">
        {registration === "full"
          ? "All team slots have been claimed. Reach out to the organiser to join the waitlist."
          : `Registration closed on ${formatDateTime(deadline)} IST. Follow the bracket and catch the next open event.`}
      </p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Link href="/tournaments" className="btn-secondary">
          Find another event
        </Link>
        <a href={`mailto:${contactEmail}`} className="btn-ghost">
          Contact organiser
        </a>
      </div>
    </div>
  );
}
