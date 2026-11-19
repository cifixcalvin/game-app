import "server-only";

import { randomUUID } from "node:crypto";

import { isUniqueViolation, query } from "./db";

export async function subscribeToNewsletter(email: string, source = "footer") {
  void source;
  try {
    await query(
      "INSERT INTO newsletter_subscribers (id, email) VALUES ($1, $2)",
      [randomUUID(), email],
    );
    return { ok: true as const, message: "You're on the list." };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: true as const, message: "You're already subscribed." };
    }
    throw error;
  }
}
