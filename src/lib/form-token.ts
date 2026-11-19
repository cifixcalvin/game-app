import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is not configured.");
  }
  return value;
}

function sign(value: string, namespace: string) {
  return createHmac("sha256", secret())
    .update(`${namespace}:${value}`)
    .digest("base64url");
}

export function createRegistrationToken(tournamentId: string, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({ t: tournamentId, iat: now, kind: "registration" }),
  ).toString("base64url");
  return `${payload}.${sign(payload, "registration")}`;
}

export function verifyRegistrationToken(
  token: string,
  tournamentId: string,
  now = Date.now(),
) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload, "registration"));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return false;
  if (!timingSafeEqual(expected, actual)) return false;

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { t?: string; iat?: number; kind?: string };
    if (decoded.kind !== "registration" || decoded.t !== tournamentId) {
      return false;
    }
    if (typeof decoded.iat !== "number") return false;
    const age = now - decoded.iat;
    return age > 1500 && age < 12 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
