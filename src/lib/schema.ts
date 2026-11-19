import "server-only";

type QueryFn = (text: string, params?: unknown[]) => Promise<unknown[]>;

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    session_version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_idx
    ON admin_users (lower(email))`,
  `CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    game TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft'
      CHECK (status IN ('draft', 'published', 'live', 'completed', 'cancelled')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    banner_url TEXT NOT NULL,
    tagline TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    prize_pool INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    entry_fee INTEGER NOT NULL DEFAULT 0,
    team_size INTEGER NOT NULL DEFAULT 1,
    max_slots INTEGER NOT NULL DEFAULT 64,
    format TEXT NOT NULL DEFAULT 'Squad',
    region TEXT NOT NULL DEFAULT 'India',
    platform TEXT NOT NULL DEFAULT 'Cross-platform',
    registration_deadline TIMESTAMPTZ NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    schedule TEXT NOT NULL DEFAULT '[]',
    rules TEXT NOT NULL DEFAULT '[]',
    prize_breakdown TEXT NOT NULL DEFAULT '[]',
    eligibility TEXT NOT NULL DEFAULT '[]',
    contact_name TEXT NOT NULL DEFAULT '',
    contact_email TEXT NOT NULL DEFAULT '',
    contact_phone TEXT NOT NULL DEFAULT '',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS tournaments_status_start_idx
    ON tournaments (status, start_at)`,
  `CREATE INDEX IF NOT EXISTS tournaments_game_idx ON tournaments (game)`,
  `CREATE INDEX IF NOT EXISTS tournaments_created_idx ON tournaments (created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'rejected', 'checked_in')),
    notes TEXT NOT NULL DEFAULT '',
    ip_hash TEXT NOT NULL DEFAULT '',
    user_agent TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS registrations_team_unique_idx
    ON registrations (tournament_id, lower(team_name))`,
  `CREATE INDEX IF NOT EXISTS registrations_tournament_idx
    ON registrations (tournament_id)`,
  `CREATE INDEX IF NOT EXISTS registrations_status_idx
    ON registrations (status)`,
  `CREATE INDEX IF NOT EXISTS registrations_created_idx
    ON registrations (created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS rate_events (
    id BIGSERIAL PRIMARY KEY,
    key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS rate_events_key_idx
    ON rate_events (key, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS newsletter_email_idx
    ON newsletter_subscribers (lower(email))`,
];

export async function runMigrations(run: QueryFn) {
  for (const statement of STATEMENTS) {
    await run(statement);
  }
}
