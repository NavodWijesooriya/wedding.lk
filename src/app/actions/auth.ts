"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema, registerSchema } from "@/lib/validation";
import { db, hashPassword, newId, row, verifyPassword } from "@/lib/db";
import { createSession, destroySession, rateLimit } from "@/lib/auth";

type AuthResult = { ok: true } | { ok: false; code: "invalid" | "email_taken" | "bad_credentials" | "rate_limited" };

async function ip() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

export async function registerAction(input: unknown): Promise<AuthResult> {
  const p = registerSchema.safeParse(input);
  if (!p.success) return { ok: false, code: "invalid" };
  if (!rateLimit(`reg:${await ip()}`, 10, 60 * 60_000)) return { ok: false, code: "rate_limited" };
  const exists = row(db().prepare("SELECT 1 FROM users WHERE email=?").get(p.data.email));
  if (exists) return { ok: false, code: "email_taken" };
  const id = newId();
  db().prepare("INSERT INTO users (id,email,name,password_hash,role,created_at) VALUES (?,?,?,?,?,?)").run(id, p.data.email, p.data.name, hashPassword(p.data.password), "user", Date.now());
  await createSession(id);
  return { ok: true };
}

export async function loginAction(input: unknown): Promise<AuthResult & { role?: string }> {
  const p = loginSchema.safeParse(input);
  if (!p.success) return { ok: false, code: "invalid" };
  if (!rateLimit(`login:${await ip()}:${p.data.email}`, 8, 10 * 60_000)) return { ok: false, code: "rate_limited" };
  const u = row<{ id: string; password_hash: string; role: string }>(db().prepare("SELECT id,password_hash,role FROM users WHERE email=?").get(p.data.email));
  // Always run a hash comparison so response time doesn't reveal whether the account exists.
  const ok = u ? verifyPassword(p.data.password, u.password_hash) : (verifyPassword(p.data.password, hashPassword("x")), false);
  if (!u || !ok) return { ok: false, code: "bad_credentials" };
  await createSession(u.id);
  return { ok: true, role: u.role };
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
