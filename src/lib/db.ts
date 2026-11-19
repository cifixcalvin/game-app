import "server-only";

import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import type { PGlite } from "@electric-sql/pglite";

import { runMigrations } from "./schema";
import { seedDatabase } from "./seed";

type QueryResult = { rows: unknown[] };

type Database = {
  driver: "neon" | "pglite";
  query: (text: string, params?: unknown[]) => Promise<unknown[]>;
};

const globalForDb = globalThis as unknown as {
  __nexusDatabase?: Promise<Database>;
};

async function createDatabase(): Promise<Database> {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    const sql = neon(connectionString);
    return {
      driver: "neon",
      query: async (text, params = []) => {
        const rows = await sql.query(text, params);
        return rows as unknown[];
      },
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon Postgres connection string to the environment.",
    );
  }

  const { PGlite: PGliteClient } = await import("@electric-sql/pglite");
  const dataDir = path.join(process.cwd(), "data", "pglite");
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });
  const client: PGlite = new PGliteClient(dataDir);
  await client.waitReady;
  console.warn(
    "[nexus] DATABASE_URL not set — using embedded PGlite Postgres for local development.",
  );

  return {
    driver: "pglite",
    query: async (text, params = []) => {
      const result = (await client.query(text, params)) as QueryResult;
      return result.rows;
    },
  };
}

export function getDatabase(): Promise<Database> {
  if (!globalForDb.__nexusDatabase) {
    globalForDb.__nexusDatabase = createDatabase()
      .then(async (database) => {
        await runMigrations(database.query);
        await seedDatabase(database.query);
        return database;
      })
      .catch((error) => {
        globalForDb.__nexusDatabase = undefined;
        throw error;
      });
  }
  return globalForDb.__nexusDatabase;
}

export async function query<T>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const database = await getDatabase();
  return (await database.query(text, params)) as T[];
}

export async function queryOne<T>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export function isUniqueViolation(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("duplicate key") ||
    message.includes("unique constraint") ||
    message.includes("23505")
  );
}
