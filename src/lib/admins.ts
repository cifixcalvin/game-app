import "server-only";

import { randomUUID } from "node:crypto";

import type { Role } from "./constants";
import { isUniqueViolation, query, queryOne } from "./db";
import { hashPassword } from "./password";
import type { AdminUser } from "./types";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string | Date;
  last_login_at: string | Date | null;
};

function asIso(value: string | Date | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function mapAdmin(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as Role,
    isActive: Boolean(row.is_active),
    createdAt: asIso(row.created_at) ?? "",
    lastLoginAt: asIso(row.last_login_at),
  };
}

export async function listAdminUsers() {
  const rows = await query<AdminUserRow>(
    `SELECT id, name, email, role, is_active, created_at, last_login_at
     FROM admin_users ORDER BY created_at ASC`,
  );
  return rows.map(mapAdmin);
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  role: Role;
  password: string;
}) {
  try {
    await query(
      `INSERT INTO admin_users (id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        randomUUID(),
        input.name,
        input.email.toLowerCase(),
        hashPassword(input.password),
        input.role,
      ],
    );
    return { ok: true as const };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false as const,
        message: "An account with that email already exists.",
      };
    }
    throw error;
  }
}

export async function updateAdminUser(
  id: string,
  input: { name: string; role: Role; isActive: boolean },
) {
  await query(
    `UPDATE admin_users SET name = $2, role = $3, is_active = $4 WHERE id = $1`,
    [id, input.name, input.role, input.isActive],
  );
}

export async function deleteAdminUser(id: string) {
  await query("DELETE FROM admin_users WHERE id = $1", [id]);
}

export async function countActiveSuperAdmins() {
  const row = await queryOne<{ count: number | string }>(
    `SELECT COUNT(*)::int AS count FROM admin_users
     WHERE role = 'super_admin' AND is_active = TRUE`,
  );
  return Number(row?.count ?? 0);
}

export async function getAdminPasswordHash(id: string) {
  const row = await queryOne<{ password_hash: string; is_active: boolean }>(
    "SELECT password_hash, is_active FROM admin_users WHERE id = $1",
    [id],
  );
  return row;
}

export async function updateAdminPassword(id: string, password: string) {
  const row = await queryOne<{ session_version: number | string }>(
    `UPDATE admin_users
     SET password_hash = $2, session_version = session_version + 1
     WHERE id = $1 RETURNING session_version`,
    [id, hashPassword(password)],
  );
  return Number(row?.session_version ?? 0);
}

export async function getAdminUser(id: string) {
  const row = await queryOne<AdminUserRow>(
    `SELECT id, name, email, role, is_active, created_at, last_login_at
     FROM admin_users WHERE id = $1`,
    [id],
  );
  return row ? mapAdmin(row) : null;
}
