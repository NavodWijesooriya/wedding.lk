// Pure, dependency-free verification of Firebase ID tokens (RS256, Google "securetoken" keys).
// Kept free of Next.js imports so it can be unit-tested directly (see e2e/firebase-verify.test.mjs).
import crypto from "node:crypto";

export type Jwk = { kid: string; kty: string; n: string; e: string; alg?: string; use?: string };
export type FirebaseIdentity = { uid: string; email: string | null; name: string | null; emailVerified: boolean };

const b64json = (s: string) => JSON.parse(Buffer.from(s, "base64url").toString("utf8"));

export async function verifyFirebaseIdToken(token: string, projectId: string, getKeys: () => Promise<Jwk[]>, nowSec = Math.floor(Date.now() / 1000)): Promise<FirebaseIdentity> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("malformed token");
  const header = b64json(parts[0]);
  const claims = b64json(parts[1]);
  if (header.alg !== "RS256" || !header.kid) throw new Error("bad header");
  const jwk = (await getKeys()).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("unknown signing key");
  const ok = crypto.verify("RSA-SHA256", Buffer.from(`${parts[0]}.${parts[1]}`), crypto.createPublicKey({ key: jwk as any, format: "jwk" }), Buffer.from(parts[2], "base64url"));
  if (!ok) throw new Error("bad signature");
  const skew = 60;
  if (claims.aud !== projectId) throw new Error("bad audience");
  if (claims.iss !== `https://securetoken.google.com/${projectId}`) throw new Error("bad issuer");
  if (typeof claims.exp !== "number" || claims.exp < nowSec - skew) throw new Error("expired");
  if (typeof claims.iat !== "number" || claims.iat > nowSec + skew) throw new Error("issued in the future");
  if (typeof claims.sub !== "string" || !claims.sub || claims.sub.length > 128) throw new Error("bad subject");
  return { uid: claims.sub, email: claims.email ?? null, name: claims.name ?? null, emailVerified: !!claims.email_verified };
}

export type FirestoreProfile = { role: "user" | "admin"; status: "pending" | "approved" | "rejected"; fullName: string; email: string };

/** Parses a Firestore REST document (typed fields) into the profile shape, or null if malformed. */
export function parseProfileDoc(doc: any): FirestoreProfile | null {
  const f = doc?.fields;
  const s = (k: string) => (typeof f?.[k]?.stringValue === "string" ? (f[k].stringValue as string) : "");
  const role = s("role"), status = s("status");
  if (!["user", "admin"].includes(role) || !["pending", "approved", "rejected"].includes(status)) return null;
  return { role: role as any, status: status as any, fullName: s("fullName"), email: s("email") };
}
