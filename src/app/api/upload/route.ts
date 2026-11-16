import { NextResponse } from "next/server";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getUser } from "@/lib/auth";
import { db, row, UPLOAD_DIR } from "@/lib/db";

export const runtime = "nodejs";
const MAX = 10 * 1024 * 1024;
const MAX_PER_USER = 150;

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  // CSRF: only accept same-origin browser requests.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const count = row<{ n: number }>(db().prepare("SELECT COUNT(*) n FROM uploads WHERE user_id=?").get(user.id))!.n;
  if (count >= MAX_PER_USER) return NextResponse.json({ error: "Upload limit reached. Please remove unused photos." }, { status: 429 });

  let file: File | null = null;
  try {
    file = (await req.formData()).get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Image is larger than 10 MB." }, { status: 413 });

  const input = Buffer.from(await file.arrayBuffer());
  try {
    const meta = await sharp(input, { limitInputPixels: 80_000_000 }).metadata();
    if (!meta.format || !["jpeg", "png", "webp", "gif", "heif", "avif"].includes(meta.format)) throw new Error("format");
    const base = sharp(input, { limitInputPixels: 80_000_000 }).rotate();
    const full = await base.clone().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    const small = await base.clone().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 74 }).toBuffer();
    const id = crypto.randomBytes(9).toString("base64url").replace(/[^\w]/g, "x");
    await fs.writeFile(path.join(UPLOAD_DIR, `${id}.webp`), full);
    await fs.writeFile(path.join(UPLOAD_DIR, `${id}-s.webp`), small);
    db().prepare("INSERT INTO uploads (id,user_id,bytes,created_at) VALUES (?,?,?,?)").run(id, user.id, full.length + small.length, Date.now());
    return NextResponse.json({ src: `/media/${id}.webp` });
  } catch {
    return NextResponse.json({ error: "That file doesn't look like a supported image (JPG, PNG, WebP)." }, { status: 415 });
  }
}
