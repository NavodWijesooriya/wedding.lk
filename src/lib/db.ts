import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || "./data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const g = globalThis as unknown as { __db?: DatabaseSync };

function init(): DatabaseSync {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new DatabaseSync(path.join(DATA_DIR, "wedding.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
      password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user', created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS weddings (
      id TEXT PRIMARY KEY, user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT UNIQUE NOT NULL, doc TEXT NOT NULL, published_doc TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      approval TEXT NOT NULL DEFAULT 'none',
      approval_note TEXT, version INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, published_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS rsvps (
      id TEXT PRIMARY KEY, wedding_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
      name TEXT NOT NULL, attending TEXT NOT NULL, guests INTEGER NOT NULL DEFAULT 1,
      phone TEXT, message TEXT, show_wish INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rsvps_wedding ON rsvps(wedding_id, created_at);
    CREATE TABLE IF NOT EXISTS uploads (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      bytes INTEGER NOT NULL, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT, wedding_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
      text TEXT NOT NULL, created_at INTEGER NOT NULL
    );
  `);
  const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "firebase_uid")) {
    db.exec("ALTER TABLE users ADD COLUMN firebase_uid TEXT");
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)");
  }
  return db;
}

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [alg, saltHex, hashHex] = stored.split("$");
  if (alg !== "scrypt") return false;
  const hash = crypto.scryptSync(pw, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  return hash.length === expected.length && crypto.timingSafeEqual(hash, expected);
}

export function db(): DatabaseSync {
  return (g.__db ??= init());
}

export const newId = () => crypto.randomUUID();
// node:sqlite returns null-prototype objects; copy to plain objects so they can cross the server→client boundary.
export const row = <T,>(v: unknown) => (v ? ({ ...(v as object) } as T) : undefined);
export const rows = <T,>(v: unknown) => (v as object[]).map((r) => ({ ...r }) as T);
