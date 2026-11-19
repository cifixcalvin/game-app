import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

import { can, type Permission } from "./authz";
import { ROLES, type Role } from "./constants";
import { query, queryOne } from "./db";
import { verifyPassword } from "./password";
import type { SessionUser } from "./types";

const COOKIE_NAME = "nexus_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const DUMMY_HASH =
  "scrypt$b3782fd9f87ff3b8a4d85d40b59f8975$d84378cffe0ca817995eca90b1676cf96f7ac92ac07d1df3b46001e964db46514d8a3f402517b7fda7d644d3e170bae629e93600b46ea1bf3c8d330e0320f9a4";

type SessionPayload = {
  sub: string;
  v: number;
  exp: number;
};

type AdminRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
  session_version: number;
};

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured.");
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.sub || !payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function asRole(value: string): Role | null {
  return (ROLES as readonly string[]).includes(value) ? (value as Role) : null;
}

export async function isLoginRateLimited() {
  return false;
}

export async function authenticateAdmin(email: string, password: string) {
  const row = await queryOne<AdminRow>(
    `SELECT id, name, email, password_hash, role, is_active, session_version
     FROM admin_users
     WHERE lower(email) = lower($1)
     LIMIT 1`,
    [email],
  );

  const passwordOk = verifyPassword(password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !row.is_active || !passwordOk) return null;

  const role = asRole(row.role);
  if (!role) return null;

  await query("UPDATE admin_users SET last_login_at = NOW() WHERE id = $1", [
    row.id,
  ]);

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role,
    sessionVersion: row.session_version,
  };
}

export async function createAdminSession(user: {
  id: string;
  sessionVersion: number;
}) {
  const expires = Date.now() + SESSION_TTL_SECONDS * 1000;
  const token = encodeSession({
    sub: user.id,
    v: user.sessionVersion,
    exp: expires,
  });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const getAdminSession = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const payload = decodeSession(store.get(COOKIE_NAME)?.value);
  if (!payload) return null;

  const row = await queryOne<AdminRow>(
    `SELECT id, name, email, role, is_active, session_version, password_hash
     FROM admin_users WHERE id = $1 LIMIT 1`,
    [payload.sub],
  );

  if (!row || !row.is_active || row.session_version !== payload.v) return null;
  const role = asRole(row.role);
  if (!role) return null;

  return { id: row.id, name: row.name, email: row.email, role };
});

export async function requireAdmin(permission?: Permission) {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");
  if (permission && !can(user.role, permission)) redirect("/admin?denied=1");
  return user;
}

export async function requireSession() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireApiAdmin(permission?: Permission) {
  const user = await getAdminSession();
  if (!user) return null;
  if (permission && !can(user.role, permission)) return null;
  return user;
}

export async function bumpSessionVersion(userId: string) {
  await query(
    "UPDATE admin_users SET session_version = session_version + 1 WHERE id = $1",
    [userId],
  );
}
