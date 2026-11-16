import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { db, row } from "./db";

export type User = { id: string; email: string; name: string; role: "user" | "admin" };

const COOKIE = "wl_session";
const TTL = 1000 * 60 * 60 * 24 * 30;
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  db().prepare("INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)").run(sha(token), userId, Date.now() + TTL);
  db().prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: TTL / 1000,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const t = jar.get(COOKIE)?.value;
  if (t) db().prepare("DELETE FROM sessions WHERE token_hash=?").run(sha(t));
  jar.delete(COOKIE);
}

export async function getUser(): Promise<User | null> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  const r = row<User & { expires_at: number }>(
    db()
      .prepare("SELECT u.id,u.email,u.name,u.role,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?")
      .get(sha(t)),
  );
  if (!r || r.expires_at < Date.now()) return null;
  return { id: r.id, email: r.email, name: r.name, role: r.role };
}

export async function requireUser(): Promise<User> {
  const u = await getUser();
  if (!u) redirect("/login");
  return u;
}

export async function requireAdmin(): Promise<User> {
  const u = await requireUser();
  if (u.role !== "admin") redirect("/dashboard");
  return u;
}

/** For server actions / route handlers: throws instead of redirecting. */
export async function assertUser(): Promise<User> {
  const u = await getUser();
  if (!u) throw new Error("UNAUTHENTICATED");
  return u;
}

// Tiny in-memory rate limiter (per process) against login / RSVP abuse.
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return true;
}
