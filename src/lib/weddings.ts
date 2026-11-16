import "server-only";
import { db, newId, row, rows } from "./db";
import type { Doc, Wish } from "./site/types";
import { slugify } from "./site/util";

export type WeddingStatus = "draft" | "pending" | "published" | "unpublished";
export type Approval = "none" | "pending" | "approved" | "rejected";

export type Wedding = {
  id: string;
  userId: string;
  slug: string;
  doc: Doc;
  publishedDoc: Doc | null;
  status: WeddingStatus;
  approval: Approval;
  approvalNote: string | null;
  version: number;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
};

type Row = {
  id: string; user_id: string; slug: string; doc: string; published_doc: string | null; status: WeddingStatus;
  approval: Approval; approval_note: string | null; version: number; created_at: number; updated_at: number; published_at: number | null;
};

const map = (r: Row): Wedding => ({
  id: r.id, userId: r.user_id, slug: r.slug, doc: JSON.parse(r.doc), publishedDoc: r.published_doc ? JSON.parse(r.published_doc) : null,
  status: r.status, approval: r.approval, approvalNote: r.approval_note, version: r.version,
  createdAt: r.created_at, updatedAt: r.updated_at, publishedAt: r.published_at,
});

export const requiresApproval = () => (process.env.REQUIRE_APPROVAL ?? "true") !== "false";

const RESERVED = new Set(["admin", "api", "login", "register", "dashboard", "editor", "create", "preview", "templates", "w", "media", "app", "www", "static"]);

export function validSlug(s: string): string | null {
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/.test(s)) return "Use 3–40 lowercase letters, numbers or hyphens.";
  if (/--/.test(s)) return "Avoid double hyphens.";
  if (RESERVED.has(s)) return "That address is reserved.";
  return null;
}

export function slugAvailable(slug: string, exceptWeddingId?: string): boolean {
  const r = row<{ id: string }>(db().prepare("SELECT id FROM weddings WHERE slug=?").get(slug));
  return !r || r.id === exceptWeddingId;
}

function uniqueSlug(base: string): string {
  let s = slugify(base) || "our-wedding";
  if (s.length < 3) s = `${s}-wedding`;
  if (RESERVED.has(s)) s = `${s}-wedding`;
  let candidate = s;
  for (let i = 0; !slugAvailable(candidate); i++) candidate = `${s.slice(0, 32)}-${Math.random().toString(36).slice(2, 6)}`;
  return candidate;
}

export function getWeddingByUser(userId: string): Wedding | null {
  const r = row<Row>(db().prepare("SELECT * FROM weddings WHERE user_id=?").get(userId));
  return r ? map(r) : null;
}

export function getWeddingById(id: string): Wedding | null {
  const r = row<Row>(db().prepare("SELECT * FROM weddings WHERE id=?").get(id));
  return r ? map(r) : null;
}

export function getPublicWedding(slug: string): Wedding | null {
  const r = row<Row>(db().prepare("SELECT * FROM weddings WHERE slug=? AND status='published' AND published_doc IS NOT NULL").get(slug));
  return r ? map(r) : null;
}

export function logActivity(weddingId: string, text: string) {
  db().prepare("INSERT INTO activity (wedding_id,text,created_at) VALUES (?,?,?)").run(weddingId, text, Date.now());
}

export function recentActivity(weddingId: string, n = 6) {
  return rows<{ id: number; text: string; created_at: number }>(
    db().prepare("SELECT id,text,created_at FROM activity WHERE wedding_id=? ORDER BY id DESC LIMIT ?").all(weddingId, n),
  );
}

export function createWedding(userId: string, doc: Doc): Wedding {
  const id = newId();
  const now = Date.now();
  const base = [doc.info.bride.en || "bride", doc.info.groom.en || "groom"].join(" and ");
  const slug = uniqueSlug(doc.info.bride.en && doc.info.groom.en ? base : "our-wedding");
  db().prepare("INSERT INTO weddings (id,user_id,slug,doc,created_at,updated_at) VALUES (?,?,?,?,?,?)").run(id, userId, slug, JSON.stringify(doc), now, now);
  logActivity(id, "Website created");
  return getWeddingById(id)!;
}

export function saveDoc(userId: string, doc: Doc): { version: number; updatedAt: number } | null {
  const w = getWeddingByUser(userId);
  if (!w) return null;
  const now = Date.now();
  db().prepare("UPDATE weddings SET doc=?, version=version+1, updated_at=? WHERE id=?").run(JSON.stringify(doc), now, w.id);
  const last = row<{ created_at: number; text: string }>(db().prepare("SELECT created_at,text FROM activity WHERE wedding_id=? ORDER BY id DESC LIMIT 1").get(w.id));
  if (!last || last.text !== "Edited website" || now - last.created_at > 30 * 60_000) logActivity(w.id, "Edited website");
  return { version: w.version + 1, updatedAt: now };
}

export function publish(userId: string): Wedding | null {
  const w = getWeddingByUser(userId);
  if (!w) return null;
  const now = Date.now();
  const live = !requiresApproval() || w.approval === "approved";
  db()
    .prepare("UPDATE weddings SET published_doc=?, status=?, approval=?, approval_note=NULL, published_at=?, updated_at=? WHERE id=?")
    .run(JSON.stringify(w.doc), live ? "published" : "pending", live ? "approved" : "pending", live ? now : w.publishedAt, now, w.id);
  logActivity(w.id, live ? (w.status === "published" ? "Published updates" : "Website published") : "Submitted for approval");
  return getWeddingById(w.id);
}

export function unpublish(userId: string): Wedding | null {
  const w = getWeddingByUser(userId);
  if (!w) return null;
  db().prepare("UPDATE weddings SET status=?, updated_at=? WHERE id=?").run(w.status === "pending" ? "draft" : "unpublished", Date.now(), w.id);
  if (w.status === "pending") db().prepare("UPDATE weddings SET approval='none' WHERE id=?").run(w.id);
  logActivity(w.id, w.status === "pending" ? "Approval request withdrawn" : "Website unpublished");
  return getWeddingById(w.id);
}

export function setSlug(userId: string, slug: string): string | null {
  const w = getWeddingByUser(userId);
  if (!w) return "Not found";
  const bad = validSlug(slug);
  if (bad) return bad;
  if (!slugAvailable(slug, w.id)) return "That address is already taken.";
  db().prepare("UPDATE weddings SET slug=?, updated_at=? WHERE id=?").run(slug, Date.now(), w.id);
  logActivity(w.id, "Website address changed");
  return null;
}

// ---- RSVP ----
export type Rsvp = { id: string; name: string; attending: "yes" | "no" | "maybe"; guests: number; phone: string | null; message: string | null; show_wish: number; created_at: number };

export function addRsvp(weddingId: string, r: { name: string; attending: Rsvp["attending"]; guests: number; phone?: string; message?: string }) {
  db()
    .prepare("INSERT INTO rsvps (id,wedding_id,name,attending,guests,phone,message,created_at) VALUES (?,?,?,?,?,?,?,?)")
    .run(newId(), weddingId, r.name, r.attending, r.guests, r.phone || null, r.message || null, Date.now());
  logActivity(weddingId, `New RSVP from ${r.name}`);
}

export const listRsvps = (weddingId: string, limit = 500) =>
  rows<Rsvp>(db().prepare("SELECT id,name,attending,guests,phone,message,show_wish,created_at FROM rsvps WHERE wedding_id=? ORDER BY created_at DESC LIMIT ?").all(weddingId, limit));

export function rsvpStats(weddingId: string) {
  const r = rows<{ attending: string; n: number; g: number }>(
    db().prepare("SELECT attending, COUNT(*) n, COALESCE(SUM(guests),0) g FROM rsvps WHERE wedding_id=? GROUP BY attending").all(weddingId),
  );
  const get = (k: string) => r.find((x) => x.attending === k);
  return {
    total: r.reduce((a, b) => a + b.n, 0),
    yes: get("yes")?.n ?? 0, no: get("no")?.n ?? 0, maybe: get("maybe")?.n ?? 0,
    guests: get("yes")?.g ?? 0,
  };
}

export const listWishes = (weddingId: string): Wish[] =>
  rows<{ id: string; name: string; message: string; created_at: number }>(
    db().prepare("SELECT id,name,message,created_at FROM rsvps WHERE wedding_id=? AND show_wish=1 AND message IS NOT NULL AND message<>'' ORDER BY created_at DESC LIMIT 60").all(weddingId),
  );

export function setWishVisible(userId: string, rsvpId: string, show: boolean) {
  db()
    .prepare("UPDATE rsvps SET show_wish=? WHERE id=? AND wedding_id IN (SELECT id FROM weddings WHERE user_id=?)")
    .run(show ? 1 : 0, rsvpId, userId);
}

export function deleteRsvp(userId: string, rsvpId: string) {
  db().prepare("DELETE FROM rsvps WHERE id=? AND wedding_id IN (SELECT id FROM weddings WHERE user_id=?)").run(rsvpId, userId);
}

// ---- Admin ----
export type AdminRow = {
  id: string; slug: string; status: WeddingStatus; approval: Approval; approval_note: string | null; updated_at: number; published_at: number | null;
  email: string; name: string; doc: string; rsvps: number;
};
export const adminList = () =>
  rows<AdminRow>(
    db().prepare(
      `SELECT w.id,w.slug,w.status,w.approval,w.approval_note,w.updated_at,w.published_at,u.email,u.name,w.doc,
        (SELECT COUNT(*) FROM rsvps r WHERE r.wedding_id=w.id) rsvps
       FROM weddings w JOIN users u ON u.id=w.user_id ORDER BY (w.approval='pending') DESC, w.updated_at DESC LIMIT 300`,
    ).all(),
  );

export function adminSetApproval(id: string, action: "approve" | "reject" | "suspend", note?: string) {
  const w = getWeddingById(id);
  if (!w) return false;
  const now = Date.now();
  if (action === "approve") {
    db().prepare("UPDATE weddings SET approval='approved', approval_note=NULL, status='published', published_at=?, updated_at=? WHERE id=? AND published_doc IS NOT NULL").run(now, now, id);
    logActivity(id, "Approved by admin — website is live");
  } else if (action === "reject") {
    db().prepare("UPDATE weddings SET approval='rejected', approval_note=?, status='draft', updated_at=? WHERE id=?").run(note || null, now, id);
    logActivity(id, "Not approved" + (note ? `: ${note}` : ""));
  } else {
    db().prepare("UPDATE weddings SET approval='rejected', approval_note=?, status='unpublished', updated_at=? WHERE id=?").run(note || "Suspended by admin", now, id);
    logActivity(id, "Website suspended by admin");
  }
  return true;
}
