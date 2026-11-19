import "server-only";

import { hashPassword } from "./password";
import type { PrizeItem, ScheduleItem } from "./types";

type QueryFn = (text: string, params?: unknown[]) => Promise<unknown[]>;

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

const CORE_RULES = [
  "All players must use their registered in-game ID for the entire event. Account sharing results in immediate disqualification.",
  "Every roster is locked 24 hours before the first match. Substitutes must be declared during check-in.",
  "Maintain sportsmanlike conduct in voice comms and match chat. Harassment or hate speech is a zero-tolerance offence.",
  "Any form of cheating, scripting, or third-party software leads to a permanent ban from Nexus Arena events.",
  "Match results are final once verified by the admin panel. Disputes must be raised within 15 minutes of match completion.",
  "Players are responsible for their own hardware, internet stability, and game updates before the scheduled match time.",
];

const ELIGIBILITY = [
  "Open to residents of India aged 16 and above.",
  "A valid government-issued ID is required for prize verification.",
  "Teams must have a minimum of 4 players plus 1 optional substitute on the roster.",
  "One player may only compete for one team in the same tournament.",
];

function prizeSplit(total: number): PrizeItem[] {
  return [
    { place: "Champion", amount: Math.round(total * 0.5), note: "Trophy + medal set" },
    { place: "Runner-up", amount: Math.round(total * 0.25), note: "Silver finish" },
    { place: "Third place", amount: Math.round(total * 0.15), note: "Bronze finish" },
    { place: "MVP", amount: Math.round(total * 0.1), note: "Player of the tournament" },
  ];
}

type SeedInput = {
  slug: string;
  title: string;
  game: string;
  status: string;
  featured?: boolean;
  tagline: string;
  description: string;
  prizePool: number;
  entryFee: number;
  teamSize: number;
  maxSlots: number;
  format: string;
  registrationDeadline: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  publishedAt: string | null;
};

function scheduleFor(deadline: string, start: string, end: string): ScheduleItem[] {
  return [
    {
      title: "Registration closes",
      at: deadline,
      detail: "Final roster verification for all submitted teams.",
    },
    {
      title: "Check-in & briefing",
      at: new Date(new Date(start).getTime() - HOUR).toISOString(),
      detail: "Captains join the admin lobby 60 minutes before kickoff.",
    },
    {
      title: "Group stage",
      at: start,
      detail: "Opening rounds across the main stage and streamed lobbies.",
    },
    {
      title: "Playoffs",
      at: new Date(new Date(start).getTime() + DAY).toISOString(),
      detail: "Top teams advance to the single-elimination bracket.",
    },
    {
      title: "Grand final",
      at: new Date(new Date(end).getTime() - 2 * HOUR).toISOString(),
      detail: "Championship series live on the Nexus Arena channel.",
    },
  ];
}

function buildTournament(input: SeedInput) {
  return {
    id: `t-${input.slug}`,
    ...input,
    featured: input.featured ?? false,
    currency: "INR",
    region: "India",
    platform: "Cross-platform",
    schedule: JSON.stringify(
      scheduleFor(input.registrationDeadline, input.startAt, input.endAt),
    ),
    rules: JSON.stringify(CORE_RULES),
    prizeBreakdown: JSON.stringify(prizeSplit(input.prizePool)),
    eligibility: JSON.stringify(ELIGIBILITY),
    contactName: "Nexus Arena Ops",
    contactEmail: "ops@nexusarena.gg",
    contactPhone: "+91 98765 43210",
    createdBy: null,
  };
}

export async function seedDatabase(run: QueryFn) {
  const now = Date.now();
  const at = (days: number, hours = 0) =>
    new Date(now + days * DAY + hours * HOUR).toISOString();

  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@nexusarena.gg").trim();
  const adminName = (process.env.ADMIN_NAME ?? "Arjun Mehta").trim();
  const adminPassword =
    process.env.ADMIN_PASSWORD ??
    (process.env.NODE_ENV !== "production" ? "NexusAdmin#2026" : "");

  if (adminPassword) {
    const existing = (await run(
      "SELECT id FROM admin_users WHERE lower(email) = lower($1) LIMIT 1",
      [adminEmail],
    )) as { id: string }[];

    if (existing.length === 0) {
      await run(
        `INSERT INTO admin_users (id, name, email, password_hash, role, is_active, created_at)
         VALUES ($1, $2, $3, $4, 'super_admin', TRUE, $5)`,
        [
          "admin-root",
          adminName,
          adminEmail,
          hashPassword(adminPassword),
          new Date().toISOString(),
        ],
      );
    }
  }

  const countRows = (await run(
    "SELECT COUNT(*)::int AS count FROM tournaments",
  )) as { count: number | string }[];

  if (Number(countRows[0]?.count ?? 0) > 0) return;
  if (process.env.SEED_DEMO_DATA === "false") return;

  const tournaments = [
    buildTournament({
      slug: "valorant-ascension",
      title: "Valorant Ascension",
      game: "valorant",
      status: "live",
      featured: true,
      tagline: "The flagship Radiant-tier showdown. One server. Sixteen squads. No second chances.",
      description:
        "Ascension is the crown jewel of the Nexus Arena calendar. Sixteen invited and qualified squads collide across a double-elimination bracket for the largest Valorant prize pool in the circuit. Every map is broadcast with full observer coverage, and the grand final runs a best-of-five format under the lights.",
      prizePool: 500000,
      entryFee: 499,
      teamSize: 5,
      maxSlots: 16,
      format: "Double Elimination",
      registrationDeadline: at(-2),
      startAt: at(0, -2),
      endAt: at(0, 5),
      createdAt: at(-18),
      publishedAt: at(-16),
    }),
    buildTournament({
      slug: "bgmi-titan-clash",
      title: "BGMI Titan Clash — Season 4",
      game: "bgmi",
      status: "published",
      tagline: "Twenty-five squads drop. Only one walks away with the Titan crown.",
      description:
        "Titan Clash returns for its fourth season with a three-day battle royale gauntlet. Teams earn placement and elimination points across Erangel, Miramar, and Sanhok before the top eight advance to the finals lobby. Expect rotations, chaos, and a whole lot of chicken dinners.",
      prizePool: 1000000,
      entryFee: 299,
      teamSize: 4,
      maxSlots: 100,
      format: "Battle Royale Points",
      registrationDeadline: at(3),
      startAt: at(5),
      endAt: at(7, 6),
      createdAt: at(-2),
      publishedAt: at(-1),
    }),
    buildTournament({
      slug: "cs2-neon-circuit",
      title: "CS2 Neon Circuit Open",
      game: "cs2",
      status: "published",
      tagline: "Open qualifiers. Pro-level production. A direct path to the Nexus main stage.",
      description:
        "The Neon Circuit is the open door to professional Counter-Strike. Thirty-two teams enter a best-of-one Swiss opening before cutting to a best-of-three playoff bracket. The finalists earn an invite to the Nexus Masters invitational later this season.",
      prizePool: 250000,
      entryFee: 0,
      teamSize: 5,
      maxSlots: 32,
      format: "Swiss",
      registrationDeadline: at(7),
      startAt: at(9),
      endAt: at(10),
      createdAt: at(-4),
      publishedAt: at(-3),
    }),
    buildTournament({
      slug: "free-fire-blaze-rush",
      title: "Free Fire Blaze Rush",
      game: "free-fire",
      status: "published",
      tagline: "Fast drops, faster eliminations. A one-night battle royale sprint.",
      description:
        "Blaze Rush is built for aggression. Twelve squads, three matches, and a shortened zone cycle keep every rotation dangerous. The highest cumulative points total after match three takes the title — no finals, no safety net.",
      prizePool: 150000,
      entryFee: 99,
      teamSize: 4,
      maxSlots: 48,
      format: "Battle Royale Points",
      registrationDeadline: at(1),
      startAt: at(2),
      endAt: at(2, 8),
      createdAt: at(-3),
      publishedAt: at(-2),
    }),
    buildTournament({
      slug: "pubg-frontier-cup",
      title: "PUBG Mobile Frontier Cup",
      game: "pubg",
      status: "published",
      tagline: "The frontier is open. Squad up and claim your territory.",
      description:
        "Frontier Cup brings together the most consistent squads on the PUBG Mobile circuit for a two-day points race. With a curated map pool and fixed drop rules, this is pure tactical battle royale with no room for luck.",
      prizePool: 300000,
      entryFee: 149,
      teamSize: 4,
      maxSlots: 64,
      format: "Battle Royale Points",
      registrationDeadline: at(-1),
      startAt: at(4),
      endAt: at(5),
      createdAt: at(-8),
      publishedAt: at(-7),
    }),
    buildTournament({
      slug: "valorant-midnight-gauntlet",
      title: "Valorant Midnight Gauntlet",
      game: "valorant",
      status: "live",
      tagline: "Late-night league. Neon lights. Zero excuses.",
      description:
        "A weekly eight-team knockout for the night owls. Midnight Gauntlet runs single elimination, best-of-three, with a rapid map veto before each series. It is the fastest way to sharpen your comp before the next Ascension cycle.",
      prizePool: 200000,
      entryFee: 199,
      teamSize: 5,
      maxSlots: 8,
      format: "Single Elimination",
      registrationDeadline: at(0, -5),
      startAt: at(0, -3),
      endAt: at(0, 4),
      createdAt: at(-9),
      publishedAt: at(-8),
    }),
    buildTournament({
      slug: "codm-strike-league",
      title: "CODM Strike League",
      game: "cod-mobile",
      status: "published",
      tagline: "Five-versus-five. Hardpoint to Search & Destroy. One champion.",
      description:
        "Strike League is a full-spectrum Call of Duty Mobile competition. Teams rotate through Hardpoint, Search & Destroy, and Control in a best-of-five series. Group stages run online before the top four fight it out in the televised playoffs.",
      prizePool: 180000,
      entryFee: 149,
      teamSize: 5,
      maxSlots: 24,
      format: "Group Stage + Playoffs",
      registrationDeadline: at(10),
      startAt: at(12),
      endAt: at(13),
      createdAt: at(-1),
      publishedAt: at(0, -2),
    }),
    buildTournament({
      slug: "fortnite-zero-point",
      title: "Fortnite Zero Point Solo Cup",
      game: "fortnite",
      status: "published",
      tagline: "No teammates. No backup. Just you and the storm.",
      description:
        "A solo battle royale cup with a twist: points are weighted toward eliminations. Zero Point rewards calculated aggression, with three heats feeding a single grand final lobby of the top 30 players.",
      prizePool: 120000,
      entryFee: 0,
      teamSize: 1,
      maxSlots: 96,
      format: "Battle Royale Points",
      registrationDeadline: at(6),
      startAt: at(8),
      endAt: at(8, 6),
      createdAt: at(-1, -4),
      publishedAt: at(0, -1),
    }),
    buildTournament({
      slug: "apex-outlands-invitational",
      title: "Apex Outlands Invitational",
      game: "apex",
      status: "draft",
      tagline: "Invite-only. Outlands rules. A new era of Apex in India.",
      description:
        "An invitation-only showcase for the most exciting Apex trios in the region. This draft is being finalised with the broadcast team and invited rosters.",
      prizePool: 400000,
      entryFee: 0,
      teamSize: 3,
      maxSlots: 20,
      format: "Battle Royale Points",
      registrationDeadline: at(18),
      startAt: at(21),
      endAt: at(22),
      createdAt: at(0, -6),
      publishedAt: null,
    }),
    buildTournament({
      slug: "cs2-collegiate-showdown",
      title: "CS2 Collegiate Showdown",
      game: "cs2",
      status: "completed",
      tagline: "Campus legends collide on the national stage.",
      description:
        "The Collegiate Showdown brought sixteen university squads together for a two-day LAN experience. From campus qualifiers to the main stage, the event crowned the next generation of Indian Counter-Strike.",
      prizePool: 100000,
      entryFee: 0,
      teamSize: 5,
      maxSlots: 16,
      format: "Single Elimination",
      registrationDeadline: at(-14),
      startAt: at(-12),
      endAt: at(-11),
      createdAt: at(-30),
      publishedAt: at(-28),
    }),
    buildTournament({
      slug: "bgmi-rookie-rumble",
      title: "BGMI Rookie Rumble",
      game: "bgmi",
      status: "completed",
      tagline: "Where the next generation of BGMI stars gets discovered.",
      description:
        "Rookie Rumble is dedicated to first-time competitive squads. A relaxed entry point with real production, coaching sessions, and a direct scouting pipeline into Nexus Arena partner orgs.",
      prizePool: 80000,
      entryFee: 49,
      teamSize: 4,
      maxSlots: 64,
      format: "Battle Royale Points",
      registrationDeadline: at(-21),
      startAt: at(-19),
      endAt: at(-18),
      createdAt: at(-40),
      publishedAt: at(-38),
    }),
    buildTournament({
      slug: "pubg-global-sprint",
      title: "PUBG Mobile Global Sprint",
      game: "pubg",
      status: "cancelled",
      tagline: "Postponed after a publisher schedule update.",
      description:
        "This event has been cancelled following a global competitive calendar update. Registered teams have been notified and entry fees fully refunded.",
      prizePool: 200000,
      entryFee: 99,
      teamSize: 4,
      maxSlots: 64,
      format: "Battle Royale Points",
      registrationDeadline: at(5),
      startAt: at(15),
      endAt: at(16),
      createdAt: at(-6),
      publishedAt: at(-5),
    }),
  ];

  for (const tournament of tournaments) {
    await run(
      `INSERT INTO tournaments (
        id, slug, title, game, status, featured, banner_url, tagline, description,
        prize_pool, currency, entry_fee, team_size, max_slots, format, region, platform,
        registration_deadline, start_at, end_at, schedule, rules, prize_breakdown,
        eligibility, contact_name, contact_email, contact_phone, published_at,
        created_at, updated_at, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23,
        $24, $25, $26, $27, $28,
        $29, $30, $31
      )`,
      [
        tournament.id,
        tournament.slug,
        tournament.title,
        tournament.game,
        tournament.status,
        tournament.featured,
        `/banners/${tournament.game}.svg`,
        tournament.tagline,
        tournament.description,
        tournament.prizePool,
        tournament.currency,
        tournament.entryFee,
        tournament.teamSize,
        tournament.maxSlots,
        tournament.format,
        tournament.region,
        tournament.platform,
        tournament.registrationDeadline,
        tournament.startAt,
        tournament.endAt,
        tournament.schedule,
        tournament.rules,
        tournament.prizeBreakdown,
        tournament.eligibility,
        tournament.contactName,
        tournament.contactEmail,
        tournament.contactPhone,
        tournament.publishedAt,
        tournament.createdAt,
        tournament.createdAt,
        tournament.createdBy,
      ],
    );
  }

  const teamNames = [
    "Phantom Protocol", "Neon Vipers", "Zero Gravity", "Crimson Circuit",
    "Rogue Dynasty", "Static Kings", "Apex Nomads", "Night Shift",
    "Ghost Frequency", "Iron Lotus", "Rapid Anomaly", "Void Runners",
    "Solar Flare", "Hexbound", "Deadlock", "Pulse Theory",
    "Obsidian Order", "Lunar Ascent", "Vector Nine", "Chain Reaction",
    "Titan Forge", "Echo Division", "Critical Path", "Quantum Leap",
    "Frostbite", "Shadow Syndicate", "Neon Wolves", "Prime Directive",
  ];

  const seedPlan: Array<{
    slug: string;
    count: number;
    status: "pending" | "confirmed" | "waitlisted" | "rejected" | "checked_in";
  }> = [
    { slug: "valorant-ascension", count: 14, status: "confirmed" },
    { slug: "bgmi-titan-clash", count: 18, status: "pending" },
    { slug: "cs2-neon-circuit", count: 9, status: "confirmed" },
    { slug: "free-fire-blaze-rush", count: 8, status: "pending" },
    { slug: "pubg-frontier-cup", count: 7, status: "waitlisted" },
    { slug: "valorant-midnight-gauntlet", count: 8, status: "checked_in" },
    { slug: "codm-strike-league", count: 5, status: "pending" },
    { slug: "fortnite-zero-point", count: 4, status: "confirmed" },
    { slug: "cs2-collegiate-showdown", count: 10, status: "checked_in" },
    { slug: "bgmi-rookie-rumble", count: 12, status: "confirmed" },
  ];

  let teamIndex = 0;
  let counter = 0;
  for (const plan of seedPlan) {
    for (let index = 0; index < plan.count; index += 1) {
      const teamName = teamNames[teamIndex % teamNames.length];
      teamIndex += 1;
      counter += 1;
      const status =
        index > plan.count - 3 && plan.status === "confirmed"
          ? "pending"
          : plan.status;
      const created = new Date(now - (counter % 10) * DAY - index * HOUR);
      const reference = `NX${String(1000 + counter)}${String.fromCharCode(
        65 + (counter % 26),
      )}`;
      await run(
        `INSERT INTO registrations (
          id, reference, tournament_id, team_name, whatsapp, contact_name, email,
          status, notes, ip_hash, user_agent, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT DO NOTHING`,
        [
          `r-${plan.slug}-${index + 1}`,
          reference,
          `t-${plan.slug}`,
          teamName,
          `+9198${String(76000000 + counter).slice(0, 8)}`,
          `Captain ${teamName.split(" ")[0]}`,
          `${teamName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          status,
          "",
          "seeded",
          "Nexus Arena seed",
          created.toISOString(),
          created.toISOString(),
        ],
      );
    }
  }
}
