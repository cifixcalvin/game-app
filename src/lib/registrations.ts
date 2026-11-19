import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

import type { RegistrationStatus } from "./constants";
import { isUniqueViolation, query, queryOne } from "./db";
import type { Registration, RegistrationWithTournament } from "./types";

type RegistrationRow = {
  id: string;
  reference: string;
  tournament_id: string;
  team_name: string;
  whatsapp: string;
  contact_name: string;
  email: string;
  status: string;
  notes: string;
  created_at: string | Date;
  updated_at: string | Date;
};

type RegistrationJoinRow = RegistrationRow & {
  tournament_title: string;
  tournament_slug: string;
  game: string;
  entry_fee: number | string;
  prize_pool: number | string;
};

function asIso(value: string | Date | null) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : value;
}

function mapRegistration(row: RegistrationRow): Registration {
  return {
    id: row.id,
    reference: row.reference,
    tournamentId: row.tournament_id,
    teamName: row.team_name,
    whatsapp: row.whatsapp,
    contactName: row.contact_name,
    email: row.email,
    status: row.status as RegistrationStatus,
    notes: row.notes,
    createdAt: asIso(row.created_at),
    updatedAt: asIso(row.updated_at),
  };
}

function mapRegistrationJoin(row: RegistrationJoinRow): RegistrationWithTournament {
  return {
    ...mapRegistration(row),
    tournamentTitle: row.tournament_title,
    tournamentSlug: row.tournament_slug,
    game: row.game,
    entryFee: Number(row.entry_fee),
    prizePool: Number(row.prize_pool),
  };
}

function makeReference() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `NX-${stamp}${suffix}`;
}

export type NewRegistration = {
  tournamentId: string;
  teamName: string;
  whatsapp: string;
  contactName: string;
  email: string;
  ipHash: string;
  userAgent: string;
};

export async function createRegistration(input: NewRegistration) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const reference = makeReference();
    try {
      const inserted = await queryOne<{ id: string; reference: string }>(
        `INSERT INTO registrations (
          id, reference, tournament_id, team_name, whatsapp, contact_name,
          email, ip_hash, user_agent
        )
        SELECT $1, $2, t.id, $3, $4, $5, $6, $7, $8
        FROM tournaments t
        WHERE t.id = $9
          AND t.status = 'published'
          AND t.registration_deadline > NOW()
          AND t.start_at > NOW()
          AND (
            SELECT COUNT(*) FROM registrations r
            WHERE r.tournament_id = t.id
              AND r.status IN ('pending', 'confirmed', 'checked_in')
          ) < t.max_slots
        RETURNING id, reference`,
        [
          randomUUID(),
          reference,
          input.teamName,
          input.whatsapp,
          input.contactName,
          input.email,
          input.ipHash,
          input.userAgent,
          input.tournamentId,
        ],
      );

      if (inserted) {
        return { ok: true as const, reference: inserted.reference };
      }

      const state = await queryOne<{
        status: string;
        deadline_passed: boolean;
        started: boolean;
        taken: number | string;
        max_slots: number | string;
      }>(
        `SELECT t.status,
          (t.registration_deadline <= NOW()) AS deadline_passed,
          (t.start_at <= NOW()) AS started,
          t.max_slots,
          (SELECT COUNT(*)::int FROM registrations r
            WHERE r.tournament_id = t.id
              AND r.status IN ('pending', 'confirmed', 'checked_in')) AS taken
         FROM tournaments t WHERE t.id = $1`,
        [input.tournamentId],
      );

      if (!state) {
        return { ok: false as const, message: "This tournament no longer exists." };
      }
      if (state.status !== "published") {
        return {
          ok: false as const,
          message: "Registration is not open for this tournament.",
        };
      }
      if (state.started) {
        return { ok: false as const, message: "This tournament has already started." };
      }
      if (state.deadline_passed) {
        return {
          ok: false as const,
          message: "The registration deadline has passed.",
        };
      }
      if (Number(state.taken) >= Number(state.max_slots)) {
        return { ok: false as const, message: "All team slots are filled." };
      }
      return {
        ok: false as const,
        message: "We could not accept that registration. Please try again.",
      };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      const message = error instanceof Error ? error.message : "";
      if (message.includes("registrations_team_unique_idx")) {
        return {
          ok: false as const,
          message:
            "That team name is already registered for this tournament. Contact support if this is a mistake.",
        };
      }
      if (message.includes("registrations_reference")) {
        continue;
      }
      return {
        ok: false as const,
        message: "That registration could not be saved. Please try again.",
      };
    }
  }

  return {
    ok: false as const,
    message: "We could not generate a reference. Please try again.",
  };
}

export type ListRegistrationsParams = {
  tournamentId?: string;
  status?: RegistrationStatus | "all";
  search?: string;
  page?: number;
  pageSize?: number;
};

function registrationWhere(params: ListRegistrationsParams, values: unknown[]) {
  const conditions = ["TRUE"];
  if (params.tournamentId && params.tournamentId !== "all") {
    values.push(params.tournamentId);
    conditions.push(`r.tournament_id = $${values.length}`);
  }
  if (params.status && params.status !== "all") {
    values.push(params.status);
    conditions.push(`r.status = $${values.length}`);
  }
  if (params.search?.trim()) {
    values.push(`%${params.search.trim()}%`);
    conditions.push(
      `(r.team_name ILIKE $${values.length} OR r.email ILIKE $${values.length}
        OR r.reference ILIKE $${values.length} OR r.whatsapp ILIKE $${values.length}
        OR r.contact_name ILIKE $${values.length})`,
    );
  }
  return conditions.join(" AND ");
}

export async function listRegistrations(params: ListRegistrationsParams = {}) {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 20, 1), 100);
  const offset = (page - 1) * pageSize;
  const values: unknown[] = [];
  const where = registrationWhere(params, values);

  const count = await queryOne<{ total: number | string }>(
    `SELECT COUNT(*)::int AS total
     FROM registrations r JOIN tournaments t ON t.id = r.tournament_id
     WHERE ${where}`,
    values,
  );

  values.push(pageSize, offset);
  const rows = await query<RegistrationJoinRow>(
    `SELECT r.*, t.title AS tournament_title, t.slug AS tournament_slug,
            t.game, t.entry_fee, t.prize_pool
     FROM registrations r JOIN tournaments t ON t.id = r.tournament_id
     WHERE ${where}
     ORDER BY r.created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );

  const total = Number(count?.total ?? 0);
  return {
    items: rows.map(mapRegistrationJoin),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getRegistrationsForTournament(tournamentId: string) {
  const rows = await query<RegistrationRow>(
    `SELECT * FROM registrations WHERE tournament_id = $1
     ORDER BY created_at DESC LIMIT 1000`,
    [tournamentId],
  );
  return rows.map(mapRegistration);
}

export async function getRecentRegistrations(limit = 6) {
  const rows = await query<RegistrationJoinRow>(
    `SELECT r.*, t.title AS tournament_title, t.slug AS tournament_slug,
            t.game, t.entry_fee, t.prize_pool
     FROM registrations r JOIN tournaments t ON t.id = r.tournament_id
     ORDER BY r.created_at DESC LIMIT $1`,
    [limit],
  );
  return rows.map(mapRegistrationJoin);
}

export async function getRegistrationById(id: string) {
  const row = await queryOne<RegistrationJoinRow>(
    `SELECT r.*, t.title AS tournament_title, t.slug AS tournament_slug,
            t.game, t.entry_fee, t.prize_pool
     FROM registrations r JOIN tournaments t ON t.id = r.tournament_id
     WHERE r.id = $1 LIMIT 1`,
    [id],
  );
  return row ? mapRegistrationJoin(row) : null;
}

export async function updateRegistration(
  id: string,
  status: RegistrationStatus,
  notes: string,
) {
  const row = await queryOne<{ id: string }>(
    `UPDATE registrations SET status = $2, notes = $3, updated_at = NOW()
     WHERE id = $1 RETURNING id`,
    [id, status, notes],
  );
  return Boolean(row);
}

export async function deleteRegistration(id: string) {
  await query("DELETE FROM registrations WHERE id = $1", [id]);
}

export async function getRegistrationStats(tournamentId?: string) {
  const values: unknown[] = [];
  let where = "TRUE";
  if (tournamentId && tournamentId !== "all") {
    values.push(tournamentId);
    where = "tournament_id = $1";
  }
  const row = await queryOne<{
    total: number | string;
    pending: number | string;
    confirmed: number | string;
    waitlisted: number | string;
    rejected: number | string;
    checked_in: number | string;
  }>(
    `SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed,
      COUNT(*) FILTER (WHERE status = 'waitlisted')::int AS waitlisted,
      COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected,
      COUNT(*) FILTER (WHERE status = 'checked_in')::int AS checked_in
     FROM registrations WHERE ${where}`,
    values,
  );
  return {
    total: Number(row?.total ?? 0),
    pending: Number(row?.pending ?? 0),
    confirmed: Number(row?.confirmed ?? 0),
    waitlisted: Number(row?.waitlisted ?? 0),
    rejected: Number(row?.rejected ?? 0),
    checkedIn: Number(row?.checked_in ?? 0),
  };
}

export async function getRegistrationsForExport(
  params: ListRegistrationsParams = {},
) {
  const values: unknown[] = [];
  const where = registrationWhere(params, values);
  const rows = await query<RegistrationJoinRow>(
    `SELECT r.*, t.title AS tournament_title, t.slug AS tournament_slug,
            t.game, t.entry_fee, t.prize_pool
     FROM registrations r JOIN tournaments t ON t.id = r.tournament_id
     WHERE ${where}
     ORDER BY r.created_at DESC LIMIT 10000`,
    values,
  );
  return rows.map(mapRegistrationJoin);
}
