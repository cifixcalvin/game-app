import "server-only";

import { query, queryOne } from "./db";

export type RateLimitResult = {
  ok: boolean;
  retryAfterMinutes: number;
  remaining: number;
};

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  const row = await queryOne<{ count: number | string }>(
    "SELECT COUNT(*)::int AS count FROM rate_events WHERE key = $1 AND created_at > $2",
    [key, cutoff],
  );
  const count = Number(row?.count ?? 0);

  if (count >= limit) {
    return {
      ok: false,
      retryAfterMinutes: Math.ceil(windowMs / 60000),
      remaining: 0,
    };
  }

  await query("INSERT INTO rate_events (key) VALUES ($1)", [key]);

  if (Math.random() < 0.08) {
    await query("DELETE FROM rate_events WHERE created_at < NOW() - INTERVAL '3 days'");
  }

  return { ok: true, retryAfterMinutes: 0, remaining: limit - count - 1 };
}
