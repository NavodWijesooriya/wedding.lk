import "server-only";
import { parseProfileDoc, verifyFirebaseIdToken, type FirebaseIdentity, type FirestoreProfile, type Jwk } from "./firebase-verify";

const projectId = () => process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
const JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

let cache: { keys: Jwk[]; exp: number } | null = null;
async function getKeys(): Promise<Jwk[]> {
  if (cache && cache.exp > Date.now()) return cache.keys;
  const res = await fetch(JWKS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("could not fetch signing keys");
  const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get("cache-control") || "")?.[1] ?? 3600);
  const { keys } = (await res.json()) as { keys: Jwk[] };
  cache = { keys, exp: Date.now() + Math.min(maxAge, 6 * 3600) * 1000 };
  return keys;
}

export const verifyIdToken = (token: string): Promise<FirebaseIdentity> => verifyFirebaseIdToken(token, projectId(), getKeys);

/** Reads users/{uid} through the Firestore REST API using the caller's own ID token, so Security Rules still apply
 *  and no service-account credentials are needed on the server. */
export async function fetchProfile(uid: string, idToken: string): Promise<FirestoreProfile | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents/users/${encodeURIComponent(uid)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` }, cache: "no-store" });
  if (!res.ok) return null;
  return parseProfileDoc(await res.json());
}
