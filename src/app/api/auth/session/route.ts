import { NextResponse } from "next/server";
import { createSession, destroySession, rateLimit } from "@/lib/auth";
import { db, newId, row } from "@/lib/db";
import { fetchProfile, verifyIdToken } from "@/lib/firebase-server";

export const runtime = "nodejs";

const sameOrigin = (req: Request) => {
  const o = req.headers.get("origin");
  return !o || new URL(o).host === req.headers.get("host");
};

/** Exchanges a Firebase ID token for the app's server session — only for approved users and admins. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!rateLimit(`session:${ip}`, 30, 10 * 60_000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { idToken } = (await req.json().catch(() => ({}))) as { idToken?: string };
  if (!idToken || typeof idToken !== "string" || idToken.length > 4096) return NextResponse.json({ error: "invalid" }, { status: 400 });

  let identity;
  try {
    identity = await verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
  const profile = await fetchProfile(identity.uid, idToken);
  if (!profile) return NextResponse.json({ error: "no_profile" }, { status: 403 });
  if (profile.role !== "admin" && profile.status !== "approved") {
    await destroySession();
    return NextResponse.json({ error: profile.status === "rejected" ? "rejected" : "pending" }, { status: 403 });
  }

  const email = (identity.email || profile.email || "").toLowerCase();
  const name = profile.fullName || identity.name || email.split("@")[0] || "Member";
  const role = profile.role === "admin" ? "admin" : "user";
  const d = db();
  // Map the Firebase account onto a local row: by firebase_uid, else adopt an existing row with the same email, else create.
  let local = row<{ id: string }>(d.prepare("SELECT id FROM users WHERE firebase_uid=?").get(identity.uid));
  if (!local && email) {
    local = row<{ id: string }>(d.prepare("SELECT id FROM users WHERE email=?").get(email));
    if (local) d.prepare("UPDATE users SET firebase_uid=? WHERE id=?").run(identity.uid, local.id);
  }
  if (local) {
    d.prepare("UPDATE users SET role=?, name=?, email=COALESCE(NULLIF(?, ''), email) WHERE id=?").run(role, name, email, local.id);
  } else {
    const id = newId();
    d.prepare("INSERT INTO users (id,email,name,password_hash,role,created_at,firebase_uid) VALUES (?,?,?,?,?,?,?)")
      .run(id, email || `${identity.uid}@firebase.local`, name, "!firebase", role, Date.now(), identity.uid);
    local = { id };
  }
  await createSession(local.id);
  return NextResponse.json({ ok: true, role });
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await destroySession();
  return NextResponse.json({ ok: true });
}
