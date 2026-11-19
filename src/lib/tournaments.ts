import "server-only";

import { randomUUID } from "node:crypto";
import type { z } from "zod";

import type { TournamentStatus } from "./constants";
import { PAGE_SIZE } from "./constants";
import { isUniqueViolation, query, queryOne } from "./db";
import type {
  PrizeItem,
  ScheduleItem,
  TournamentWithCounts,
} from "./types";
import type { tournamentFormSchema } from "./validation";

export type TournamentInput = z.infer<typeof tournamentFormSchema> & {
  featured: boolean;
};

type TournamentRow = {
  id: string;
  slug: string;
  title: string;
  game: string;
  status: string;
  featured: boolean;
  banner_url: string;
  tagline: string;
  description: string;
  prize_pool: number | string;
  currency: string;
  entry_fee: number | string;
  team_size: number | string;
  max_slots: number | string;
  format: string;
  region: string;
  platform: string;
  registration_deadline: string | Date;
  start_at: string | Date;
  end_at: string | Date;
  schedule: string | ScheduleItem[];
  rules: string | string[];
  prize_breakdown: string | PrizeItem[];
  eligibility: string | string[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  published_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
  created_by: string | null;
  registered_teams: number | string;
};

const SELECT_TOURNAMENT = `
  SELECT t.*,
    COALESCE((
      SELECT COUNT(*)::int FROM registrations r
      WHERE r.tournament_id = t.id
        AND r.status IN ('confirmed', 'checked_in')
    ), 0) AS registered_teams
  FROM tournaments t
`;

function asIso(value: string | Date | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function parseJson<T>(value: string | T, fallback: T): T {
  if (typeof value !== "string") return value ?? fallback;
  try {
    const parsed = JSON.parse(value) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function mapTournament(row: TournamentRow): TournamentWithCounts {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    game: row.game,
    status: row.status as TournamentStatus,
    featured: Boolean(row.featured),
    bannerUrl: row.banner_url,
    tagline: row.tagline,
    description: row.description,
    prizePool: Number(row.prize_pool),
    currency: row.currency,
    entryFee: Number(row.entry_fee),
    teamSize: Number(row.team_size),
    maxSlots: Number(row.max_slots),
    format: row.format,
    region: row.region,
    platform: row.platform,
    registrationDeadline: asIso(row.registration_deadline) ?? "",
    startAt: asIso(row.start_at) ?? "",
    endAt: asIso(row.end_at) ?? "",
    schedule: parseJson<ScheduleItem[]>(row.schedule, []),
    rules: parseJson<string[]>(row.rules, []),
    prizeBreakdown: parseJson<PrizeItem[]>(row.prize_breakdown, []),
    eligibility: parseJson<string[]>(row.eligibility, []),
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    publishedAt: asIso(row.published_at),
    createdAt: asIso(row.created_at) ?? "",
    updatedAt: asIso(row.updated_at) ?? "",
    createdBy: row.created_by,
    registeredTeams: Number(row.registered_teams),
  };
}

export type ListTournamentsParams = {
  scope?: "public" | "admin";
  game?: string;
  status?: TournamentStatus | "upcoming" | "live" | "completed" | "all";
  search?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  sort?: "soonest" | "prize" | "newest";
};

function statusCondition(
  scope: "public" | "admin",
  status: ListTournamentsParams["status"],
) {
  if (status === "upcoming") {
    return `t.status = 'published' AND t.start_at > NOW()`;
  }
  if (status === "live") {
    return `(t.status = 'live' OR (t.status = 'published' AND t.start_at <= NOW() AND t.end_at > NOW()))`;
  }
  if (status === "completed") {
    return `(t.status = 'completed' OR (t.status IN ('published', 'live') AND t.end_at <= NOW()))`;
  }
  if (scope === "public") {
    if (status && status !== "all") {
      if (status === "draft" || status === "cancelled") {
        return "t.status = 'published' AND FALSE";
      }
      return `t.status = '${status}'`;
    }
    return `t.status IN ('published', 'live', 'completed')`;
  }
  if (status && status !== "all") {
    return `t.status = '${status}'`;
  }
  return "TRUE";
}

export async function listTournaments(params: ListTournamentsParams = {}) {
  const scope = params.scope ?? "public";
  const pageSize = Math.min(Math.max(params.pageSize ?? PAGE_SIZE, 1), 60);
  const page = Math.max(params.page ?? 1, 1);
  const offset = (page - 1) * pageSize;
  const values: unknown[] = [];

  const conditions = [statusCondition(scope, params.status)];

  if (params.game && params.game !== "all") {
    values.push(params.game);
    conditions.push(`t.game = $${values.length}`);
  }
  if (params.featured !== undefined) {
    values.push(params.featured);
    conditions.push(`t.featured = $${values.length}`);
  }
  if (params.search?.trim()) {
    values.push(`%${params.search.trim()}%`);
    conditions.push(
      `(t.title ILIKE $${values.length} OR t.tagline ILIKE $${values.length} OR t.game ILIKE $${values.length})`,
    );
  }

  const where = conditions.join(" AND ");
  const order =
    params.sort === "prize"
      ? "t.prize_pool DESC, t.start_at ASC"
      : params.sort === "newest" || scope === "admin"
        ? "t.created_at DESC"
        : "t.featured DESC, t.start_at ASC";

  const countRow = await queryOne<{ total: number | string }>(
    `SELECT COUNT(*)::int AS total FROM tournaments t WHERE ${where}`,
    values,
  );

  values.push(pageSize, offset);
  const rows = await query<TournamentRow>(
    `${SELECT_TOURNAMENT}
     WHERE ${where}
     ORDER BY ${order}
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );

  const total = Number(countRow?.total ?? 0);
  return {
    items: rows.map(mapTournament),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getFeaturedTournaments(limit = 3) {
  const rows = await query<TournamentRow>(
    `${SELECT_TOURNAMENT}
     WHERE t.status IN ('published', 'live')
       AND t.featured = TRUE
       AND t.end_at > NOW()
     ORDER BY t.status = 'live' DESC, t.start_at ASC
     LIMIT $1`,
    [limit],
  );
  return rows.map(mapTournament);
}

export async function getActiveTournaments(limit = 6) {
  const rows = await query<TournamentRow>(
    `${SELECT_TOURNAMENT}
     WHERE (t.status = 'live'
       OR (t.status = 'published' AND t.end_at > NOW()))
     ORDER BY t.status = 'live' DESC, t.featured DESC, t.start_at ASC
     LIMIT $1`,
    [limit],
  );
  return rows.map(mapTournament);
}

export async function getTournamentBySlug(slug: string) {
  const row = await queryOne<TournamentRow>(
    `${SELECT_TOURNAMENT} WHERE t.slug = $1 AND t.status <> 'draft' LIMIT 1`,
    [slug],
  );
  return row ? mapTournament(row) : null;
}

export async function getTournamentById(id: string) {
  const row = await queryOne<TournamentRow>(
    `${SELECT_TOURNAMENT} WHERE t.id = $1 LIMIT 1`,
    [id],
  );
  return row ? mapTournament(row) : null;
}

export async function getRelatedTournaments(
  game: string,
  excludeSlug: string,
  limit = 3,
) {
  const rows = await query<TournamentRow>(
    `${SELECT_TOURNAMENT}
     WHERE t.status IN ('published', 'live')
       AND t.game = $1
       AND t.slug <> $2
       AND t.end_at > NOW()
     ORDER BY t.featured DESC, t.start_at ASC
     LIMIT $3`,
    [game, excludeSlug, limit],
  );
  return rows.map(mapTournament);
}

export async function getPublicTournamentStats() {
  const row = await queryOne<{
    active_tournaments: number | string;
    all_tournaments: number | string;
    prize_pool: number | string;
    teams: number | string;
    players: number | string;
  }>(
    `SELECT
      (SELECT COUNT(*)::int FROM tournaments WHERE status IN ('published', 'live')) AS active_tournaments,
      (SELECT COUNT(*)::int FROM tournaments) AS all_tournaments,
      (SELECT COALESCE(SUM(prize_pool), 0)::bigint FROM tournaments WHERE status IN ('published', 'live')) AS prize_pool,
      (SELECT COUNT(*)::int FROM registrations WHERE status IN ('confirmed', 'checked_in')) AS teams,
      (SELECT COALESCE(SUM(t.team_size), 0)::int
         FROM registrations r JOIN tournaments t ON t.id = r.tournament_id
         WHERE r.status IN ('confirmed', 'checked_in')) AS players`,
  );
  return {
    activeTournaments: Number(row?.active_tournaments ?? 0),
    allTournaments: Number(row?.all_tournaments ?? 0),
    prizePool: Number(row?.prize_pool ?? 0),
    teams: Number(row?.teams ?? 0),
    players: Number(row?.players ?? 0),
  };
}

export async function getAdminTournamentStats() {
  const row = await queryOne<{
    total: number | string;
    published: number | string;
    live: number | string;
    draft: number | string;
    registrations: number | string;
    pending: number | string;
    teams: number | string;
  }>(
    `SELECT
      (SELECT COUNT(*)::int FROM tournaments) AS total,
      (SELECT COUNT(*)::int FROM tournaments WHERE status = 'published') AS published,
      (SELECT COUNT(*)::int FROM tournaments WHERE status = 'live') AS live,
      (SELECT COUNT(*)::int FROM tournaments WHERE status = 'draft') AS draft,
      (SELECT COUNT(*)::int FROM registrations) AS registrations,
      (SELECT COUNT(*)::int FROM registrations WHERE status = 'pending') AS pending,
      (SELECT COUNT(*)::int FROM registrations WHERE status IN ('confirmed', 'checked_in')) AS teams`,
  );
  return {
    total: Number(row?.total ?? 0),
    published: Number(row?.published ?? 0),
    live: Number(row?.live ?? 0),
    draft: Number(row?.draft ?? 0),
    registrations: Number(row?.registrations ?? 0),
    pending: Number(row?.pending ?? 0),
    teams: Number(row?.teams ?? 0),
  };
}

export async function createTournament(input: TournamentInput, userId: string) {
  const id = randomUUID();
  const publishedAt = ["published", "live", "completed"].includes(input.status)
    ? new Date().toISOString()
    : null;

  try {
    await query(
      `INSERT INTO tournaments (
        id, slug, title, game, status, featured, banner_url, tagline, description,
        prize_pool, currency, entry_fee, team_size, max_slots, format, region,
        platform, registration_deadline, start_at, end_at, schedule, rules,
        prize_breakdown, eligibility, contact_name, contact_email, contact_phone,
        published_at, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
      )`,
      [
        id,
        input.slug,
        input.title,
        input.game,
        input.status,
        input.featured,
        input.bannerUrl,
        input.tagline,
        input.description,
        input.prizePool,
        input.currency.toUpperCase(),
        input.entryFee,
        input.teamSize,
        input.maxSlots,
        input.format,
        input.region,
        input.platform,
        input.registrationDeadline,
        input.startAt,
        input.endAt,
        JSON.stringify(input.schedule),
        JSON.stringify(input.rules),
        JSON.stringify(input.prizeBreakdown),
        JSON.stringify(input.eligibility),
        input.contactName,
        input.contactEmail,
        input.contactPhone,
        publishedAt,
        userId,
      ],
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false as const, message: "That slug is already in use." };
    }
    throw error;
  }

  return { ok: true as const, id };
}

export async function updateTournament(
  id: string,
  input: TournamentInput,
  userId: string,
) {
  const existing = await queryOne<{ published_at: string | Date | null }>(
    "SELECT published_at FROM tournaments WHERE id = $1",
    [id],
  );
  if (!existing) return { ok: false as const, message: "Tournament not found." };

  const publishedAt =
    asIso(existing.published_at) ??
    (["published", "live", "completed"].includes(input.status)
      ? new Date().toISOString()
      : null);

  try {
    await query(
      `UPDATE tournaments SET
        slug = $2, title = $3, game = $4, status = $5, featured = $6,
        banner_url = $7, tagline = $8, description = $9, prize_pool = $10,
        currency = $11, entry_fee = $12, team_size = $13, max_slots = $14,
        format = $15, region = $16, platform = $17, registration_deadline = $18,
        start_at = $19, end_at = $20, schedule = $21, rules = $22,
        prize_breakdown = $23, eligibility = $24, contact_name = $25,
        contact_email = $26, contact_phone = $27, published_at = $28,
        updated_at = NOW(), created_by = COALESCE(created_by, $29)
      WHERE id = $1`,
      [
        id,
        input.slug,
        input.title,
        input.game,
        input.status,
        input.featured,
        input.bannerUrl,
        input.tagline,
        input.description,
        input.prizePool,
        input.currency.toUpperCase(),
        input.entryFee,
        input.teamSize,
        input.maxSlots,
        input.format,
        input.region,
        input.platform,
        input.registrationDeadline,
        input.startAt,
        input.endAt,
        JSON.stringify(input.schedule),
        JSON.stringify(input.rules),
        JSON.stringify(input.prizeBreakdown),
        JSON.stringify(input.eligibility),
        input.contactName,
        input.contactEmail,
        input.contactPhone,
        publishedAt,
        userId,
      ],
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false as const, message: "That slug is already in use." };
    }
    throw error;
  }

  return { ok: true as const, id };
}

export async function updateTournamentStatus(
  id: string,
  status: TournamentStatus,
) {
  await query(
    `UPDATE tournaments SET
       status = $2,
       published_at = CASE
         WHEN $2 IN ('published', 'live', 'completed') AND published_at IS NULL THEN NOW()
         ELSE published_at
       END,
       updated_at = NOW()
     WHERE id = $1`,
    [id, status],
  );
}

export async function deleteTournament(id: string) {
  await query("DELETE FROM tournaments WHERE id = $1", [id]);
}

export function isSlugConflict(error: unknown) {
  return isUniqueViolation(error);
}
