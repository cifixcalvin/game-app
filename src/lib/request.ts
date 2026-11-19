import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

export async function getRequestContext() {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || store.get("x-real-ip") || "local";
  const userAgent = (store.get("user-agent") ?? "unknown").slice(0, 240);
  const ipHash = createHash("sha256")
    .update(`${ip}:${process.env.SESSION_SECRET ?? "local"}`)
    .digest("hex");
  return { ip, ipHash, userAgent };
}
