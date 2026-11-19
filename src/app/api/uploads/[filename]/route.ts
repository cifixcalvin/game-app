import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!/^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|svg)$/.test(filename)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(
      path.join(process.cwd(), "data", "uploads", path.basename(filename)),
    );
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": MIME[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
