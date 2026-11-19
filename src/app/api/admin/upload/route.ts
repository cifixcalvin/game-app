import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireApiAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 4 * 1024 * 1024;

const TYPES = {
  "image/jpeg": { ext: "jpg", magic: [0xff, 0xd8, 0xff] },
  "image/png": { ext: "png", magic: [0x89, 0x50, 0x4e, 0x47] },
  "image/webp": { ext: "webp", magic: [0x52, 0x49, 0x46, 0x46] },
} as const;

type AllowedType = keyof typeof TYPES;

export async function POST(request: Request) {
  const user = await requireApiAdmin("tournament:edit");
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Image must be smaller than 4MB." },
      { status: 400 },
    );
  }

  const type = file.type as AllowedType;
  const config = TYPES[type];
  if (!config) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, or WebP image." },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const magicOk = config.magic.every((byte, index) => bytes[index] === byte);
  if (!magicOk) {
    return NextResponse.json(
      { error: "That file does not look like a valid image." },
      { status: 400 },
    );
  }

  const filename = `${randomUUID()}.${config.ext}`;
  const directory = path.join(process.cwd(), "data", "uploads");
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), bytes);

  return NextResponse.json({ url: `/api/uploads/${filename}` });
}
