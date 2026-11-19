import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  Flame,
  ShieldCheck,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import { Countdown } from "@/components/countdown";
import { GameTag } from "@/components/game-tag";
import { SectionHeading } from "@/components/section-heading";
import { StatusBadge } from "@/components/status-badge";
import { TournamentCard } from "@/components/tournament-card";
import { GAMES } from "@/lib/constants";
import {
  getActiveTournaments,
  getFeaturedTournaments,
  getPublicTournamentStats,
} from "@/lib/tournaments";
import {
  formatCurrency,
  formatCurrencyShort,
  formatDateRange,
  formatNumber,
  getRegistrationWindow,
  getTournamentPhase,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified brackets",
    body: "Every match, result, and tiebreaker is locked into a transparent competitive record.",
    tag: "01",
  },
  {
    icon: Zap,
    title: "Zero-friction entry",
    body: "No accounts to create, no downloads to chase. Register your squad in under sixty seconds.",
    tag: "02",
  },
  {
    icon: Trophy,
    title: "Real stakes",
    body: "Published prize pools, clear payout splits, and organisers who actually show up.",
    tag: "03",
  },
];

export default async function HomePage() {
  const [featured, active, stats] = await Promise.all([
    getFeaturedTournaments(1),
    getActiveTournaments(6),
    getPublicTournamentStats(),
  ]);

  const hero = featured[0] ?? active[0];
  const heroPhase = hero ? getTournamentPhase(hero) : null;
  const heroWindow = hero ? getRegistrationWindow(hero) : null;

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full bg-[#b6ff2e]/[0.08] blur-[120px]" />
          <div className="absolute top-1/3 left-[-15%] h-[420px] w-[420px] rounded-full bg-[#55a7ff]/[0.05] blur-[110px]" />
        </div>

        <div className="container-shell relative grid gap-14 pt-16 pb-20 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-10 lg:pt-24 lg:pb-24">
          <div className="animate-rise">
            <p className="eyebrow">The national esports circuit</p>
            <h1 className="display mt-5 text-[50px] leading-[0.94] font-bold tracking-[-0.035em] text-white sm:text-[68px] lg:text-[76px]">
              Play loud.
              <br />
              <span className="neon-text">Win bigger.</span>
            </h1>
            <p className="mt-6 max-w-[480px] text-[15px] leading-7 text-white/50 sm:text-base">
              Elite tournaments across India&apos;s biggest titles. Register your
              squad, show up, and take your shot at the prize pool.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/tournaments" className="btn-primary h-12 px-6">
                Browse tournaments
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact#organisers" className="btn-secondary h-12 px-6">
                Host with Nexus
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid max-w-[500px] grid-cols-3 divide-x divide-white/[0.08] border-y border-white/[0.07] py-5">
              <HeroStat
                value={formatCurrencyShort(stats.prizePool)}
                label="Live prize pool"
                accent
              />
              <HeroStat
                value={formatNumber(stats.teams)}
                label="Squads in play"
                className="pl-5"
              />
              <HeroStat
                value={String(GAMES.length)}
                label="Titles hosted"
                className="pl-5"
              />
            </div>
          </div>

          {hero && heroPhase && heroWindow ? (
            <div
              className="animate-rise relative"
              style={{ animationDelay: "120ms" }}
            >
              <div className="absolute -inset-4 -z-10 rounded-[32px] bg-[#b6ff2e]/[0.035] blur-2xl" />
              <Link
                href={`/tournaments/${hero.slug}`}
                className="surface card-cut group block overflow-hidden"
              >
                <div className="relative h-[300px] overflow-hidden sm:h-[340px]">
                  <img
                    src={hero.bannerUrl}
                    alt={`${hero.title} banner`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090d09] via-[#090d09]/25 to-black/10" />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
                    <StatusBadge phase={heroPhase} window={heroWindow} />
                    <span className="mono flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[9px] tracking-[0.16em] text-white/60 uppercase backdrop-blur">
                      <Flame className="h-3 w-3 text-[#b6ff2e]" />
                      Headline event
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <GameTag game={hero.game} />
                    <h2 className="display mt-2 text-[26px] leading-tight font-semibold text-white sm:text-[30px]">
                      {hero.title}
                    </h2>
                    <p className="mt-1.5 line-clamp-1 text-[13px] text-white/45">
                      {hero.tagline}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-[1.15fr_0.85fr] sm:p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                      <span className="mono text-[9px] tracking-[0.15em] text-white/30 uppercase">
                        Prize pool
                      </span>
                      <span className="display text-lg font-semibold text-[#d7ff8a]">
                        {formatCurrency(hero.prizePool, hero.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                      <span className="mono text-[9px] tracking-[0.15em] text-white/30 uppercase">
                        Format
                      </span>
                      <span className="text-xs text-white/70">{hero.format}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="mono text-[9px] tracking-[0.15em] text-white/30 uppercase">
                        Window
                      </span>
                      <span className="text-xs text-white/70">
                        {formatDateRange(hero.startAt, hero.endAt)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.07] bg-black/25 p-4">
                    {heroWindow === "open" ? (
                      <Countdown
                        target={hero.registrationDeadline}
                        label="Registration closes"
                      />
                    ) : (
                      <div>
                        <p className="mono text-[9px] tracking-[0.18em] text-white/30 uppercase">
                          Entry status
                        </p>
                        <p className="display mt-2 text-lg font-semibold text-white">
                          {heroWindow === "full"
                            ? "All slots claimed"
                            : "Registration closed"}
                        </p>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between text-[11px] text-white/40">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-white/25" />
                        {hero.registeredTeams}/{hero.maxSlots} teams
                      </span>
                      <span className="mono text-[9px] tracking-[0.12em] text-[#b6ff2e] uppercase">
                        {heroWindow === "open" ? "Open" : "Locked"}
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-[#b6ff2e]"
                        style={{
                          width: `${Math.min(100, (hero.registeredTeams / hero.maxSlots) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div className="surface card-cut grid min-h-[420px] place-items-center p-8 text-center">
              <div>
                <Trophy className="mx-auto h-10 w-10 text-[#b6ff2e]/50" />
                <p className="display mt-4 text-2xl font-semibold text-white">
                  The next drop is loading.
                </p>
                <p className="mt-2 max-w-xs text-sm text-white/40">
                  New brackets and prize pools are being locked in. Check back
                  shortly.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden border-t border-white/[0.06] bg-black/20 py-3.5">
          <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
            {[...GAMES, ...GAMES].map((game, index) => (
              <span
                key={`${game.id}-${index}`}
                className="mono flex items-center gap-8 text-[10px] tracking-[0.18em] text-white/30 uppercase"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{ backgroundColor: game.color }}
                  />
                  {game.name}
                </span>
                <span className="text-[#b6ff2e]/40">/</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Live & upcoming"
            title={
              <>
                The board is <span className="text-[#b6ff2e]">stacked.</span>
              </>
            }
            description="Fresh brackets, open registrations, and live showdowns. Pick a title and claim your slot."
            action={
              <Link href="/tournaments" className="btn-secondary">
                All tournaments
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />

          {active.length ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((tournament, index) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="surface mt-10 rounded-2xl px-6 py-16 text-center">
              <Trophy className="mx-auto h-8 w-8 text-white/20" />
              <p className="display mt-4 text-xl font-semibold text-white/70">
                No active tournaments yet
              </p>
              <p className="mt-2 text-sm text-white/35">
                The next season is being prepared. Join the newsletter to hear
                first.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="relative border-y border-white/[0.06] bg-[#070a07]">
        <div className="container-shell py-20 sm:py-24">
          <SectionHeading
            eyebrow="Pick your battlefield"
            title="Eight titles. One arena."
            description="From tactical five-stacks to full battle royale lobbies — if it competes, it lives here."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {GAMES.map((game, index) => (
              <Link
                key={game.id}
                href={`/tournaments?game=${game.id}`}
                className="group relative h-[150px] overflow-hidden rounded-xl border border-white/[0.08] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
                style={{
                  background: `radial-gradient(circle at 100% 0%, ${game.tint}, transparent 58%), #090d09`,
                }}
              >
                <div className="absolute inset-0 grid-lines opacity-30" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span
                      className="mono rounded-full border px-2 py-1 text-[8px] tracking-[0.14em] uppercase"
                      style={{
                        color: game.color,
                        borderColor: `${game.color}40`,
                        backgroundColor: `${game.color}12`,
                      }}
                    >
                      {game.genre}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/25 transition-colors group-hover:text-white" />
                  </div>
                  <div>
                    <p className="mono text-[9px] tracking-[0.2em] text-white/25 uppercase">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="display mt-1 text-xl font-semibold text-white">
                      {game.name}
                    </p>
                    <p
                      className="mt-0.5 text-[10px] tracking-[0.16em] uppercase"
                      style={{ color: game.color }}
                    >
                      {game.short} circuit
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-shell">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="eyebrow">Built for competitors</p>
              <h2 className="display mt-4 text-[36px] leading-[1.03] font-semibold tracking-tight text-white sm:text-[48px]">
                Less admin.
                <br />
                More <span className="text-[#b6ff2e]">clutch.</span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-white/45">
                We handle the boring parts so your squad can focus on the
                server. Clean brackets, verified results, and prize pools that
                mean something.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["No account needed", "Instant confirmation", "Human support"].map(
                  (item) => (
                    <span key={item} className="chip border-white/10 text-white/50">
                      <BadgeCheck className="h-3 w-3 text-[#b6ff2e]" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="space-y-3">
              {features.map(({ icon: Icon, title, body, tag }) => (
                <div
                  key={title}
                  className="surface group flex gap-5 rounded-xl p-5 transition-colors hover:border-[#b6ff2e]/25 sm:p-6"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-[#b6ff2e]/20 bg-[#b6ff2e]/[0.06] text-[#b6ff2e]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="display text-lg font-semibold text-white">
                        {title}
                      </h3>
                      <span className="mono text-[9px] tracking-[0.16em] text-white/20">
                        {tag}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-6 text-white/42">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">
            <PlatformStat
              icon={Trophy}
              value={formatCurrencyShort(stats.prizePool)}
              label="Prize pool in play"
            />
            <PlatformStat
              icon={Users}
              value={formatNumber(stats.players)}
              label="Registered players"
            />
            <PlatformStat
              icon={CalendarCheck}
              value={String(stats.activeTournaments)}
              label="Active events"
            />
            <PlatformStat
              icon={Flame}
              value={String(stats.allTournaments)}
              label="Brackets hosted"
            />
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-shell">
          <div className="relative overflow-hidden rounded-2xl border border-[#b6ff2e]/20 bg-[#b6ff2e]/[0.055] px-6 py-14 sm:px-12 sm:py-16">
            <div className="absolute inset-0 grid-lines opacity-30" />
            <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#b6ff2e]/15 blur-[90px]" />
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="eyebrow">Season zero is open</p>
                <h2 className="display mt-4 max-w-2xl text-[38px] leading-[0.98] font-bold tracking-tight text-white sm:text-[56px]">
                  Your squad.
                  <br />
                  Your <span className="neon-text">moment.</span>
                </h2>
              </div>
              <div className="flex flex-col items-start gap-4">
                <p className="max-w-sm text-sm leading-6 text-white/50">
                  Registration takes less than a minute. Bring five, bring a
                  friend, bring the noise.
                </p>
                <Link href="/tournaments" className="btn-primary h-12 px-6">
                  Claim your slot
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroStat({
  value,
  label,
  accent = false,
  className,
}: {
  value: string;
  label: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p
        className={`display text-2xl font-semibold tracking-tight sm:text-[28px] ${accent ? "text-[#b6ff2e]" : "text-white"}`}
      >
        {value}
      </p>
      <p className="mono mt-1 text-[8px] tracking-[0.14em] text-white/30 uppercase">
        {label}
      </p>
    </div>
  );
}

function PlatformStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Trophy;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-[#080b08] px-5 py-6 sm:px-6">
      <Icon className="h-4 w-4 text-[#b6ff2e]/60" />
      <p className="display mt-4 text-2xl font-semibold text-white sm:text-[28px]">
        {value}
      </p>
      <p className="mono mt-1 text-[8px] tracking-[0.14em] text-white/30 uppercase">
        {label}
      </p>
    </div>
  );
}
