// Unit test for Firebase ID-token verification + Firestore profile parsing (no Firebase project needed).
// Run: node --experimental-strip-types e2e/firebase-verify.test.mjs
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { verifyFirebaseIdToken, parseProfileDoc } from "../src/lib/firebase-verify.ts";

const PID = "demo-project";
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const other = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "k1", alg: "RS256", use: "sig" };
const keys = async () => [jwk];
const now = Math.floor(Date.now() / 1000);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
function sign(claims, { key = privateKey, header = { alg: "RS256", kid: "k1", typ: "JWT" } } = {}) {
  const body = `${b64(header)}.${b64(claims)}`;
  return `${body}.${crypto.sign("RSA-SHA256", Buffer.from(body), key).toString("base64url")}`;
}
const good = { aud: PID, iss: `https://securetoken.google.com/${PID}`, sub: "uid123", iat: now - 10, exp: now + 3600, email: "a@b.lk", email_verified: true, name: "Amaya" };
const rejects = async (token, msg) => assert.rejects(() => verifyFirebaseIdToken(token, PID, keys), { message: msg });

assert.deepEqual(await verifyFirebaseIdToken(sign(good), PID, keys), { uid: "uid123", email: "a@b.lk", name: "Amaya", emailVerified: true });
await rejects(sign(good, { key: other.privateKey }), "bad signature");
await rejects(sign({ ...good, aud: "other" }), "bad audience");
await rejects(sign({ ...good, iss: "https://evil.example/" }), "bad issuer");
await rejects(sign({ ...good, exp: now - 3600 }), "expired");
await rejects(sign({ ...good, iat: now + 3600 }), "issued in the future");
await rejects(sign({ ...good, sub: "" }), "bad subject");
await rejects(sign(good, { header: { alg: "RS256", kid: "nope" } }), "unknown signing key");
await rejects(sign(good, { header: { alg: "none", kid: "k1" } }), "bad header");
await rejects("not.a.jwt.at.all", "malformed token");
// alg-confusion: an HS256 token "signed" with the public key must be refused
await rejects(`${b64({ alg: "HS256", kid: "k1" })}.${b64(good)}.x`, "bad header");

const f = (s) => ({ stringValue: s });
assert.deepEqual(parseProfileDoc({ fields: { role: f("admin"), status: f("approved"), fullName: f("A"), email: f("a@b.lk") } }), { role: "admin", status: "approved", fullName: "A", email: "a@b.lk" });
assert.equal(parseProfileDoc({ fields: { role: f("superuser"), status: f("approved") } }), null);
assert.equal(parseProfileDoc({ fields: { role: f("user"), status: f("whatever") } }), null);
assert.equal(parseProfileDoc({}), null);
console.log("firebase-verify: all assertions passed");
