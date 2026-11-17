# Wedding.lk — Sri Lankan wedding invitation website builder

A Next.js (App Router, TypeScript, Tailwind CSS v4) platform where couples create, edit, preview and publish a
Sinhala / English wedding invitation website without writing code.

> **Architecture note.** Identity, roles and **user approval live in Firebase** (Authentication + Firestore). Website data
> (documents, RSVPs, uploads) stays in SQLite (`node:sqlite`, Node ≥ 22.13) and images on local disk (`sharp` → WebP). A server
> route verifies the Firebase ID token and the user's Firestore status before issuing the app session, so the dashboard,
> builder and every server action remain protected server-side.

## Run it

```bash
cp .env.example .env.local   # fill in the Firebase values
npm install
npm run dev                  # or: npm run build && npm start
```
Persist `DATA_DIR` in production (database + uploads). Behind plain HTTP set `INSECURE_COOKIES=1`.

## Firebase setup

1. **Create a project** at <https://console.firebase.google.com>, add a *Web app* and copy its config into `.env.local`
   (`NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID`).
2. **Authentication → Sign-in method**: enable *Email/Password* and *Google*. Under *Settings → Authorized domains* add your production domain.
3. **Firestore Database**: create it (production mode), then publish the rules in [`firestore.rules`](./firestore.rules)
   (Console → Firestore → Rules, or `firebase deploy --only firestore:rules`).
4. **Create the first admin** (rules deliberately prevent anyone from promoting themselves): sign up on `/signup`, then in
   Console → Firestore → `users/<uid>` set `role` = `admin` and `status` = `approved`. That admin approves everyone else at `/admin`.

### How approval works
* Sign-up (email/password or Google) creates `users/{uid}` = `{ uid, email, fullName, role: 'user', status: 'pending', createdAt }`.
* `ApprovalGuard` wraps the dashboard, builder and auth pages: **pending** → "Account pending approval", **rejected** → "Access denied",
  **approved** or **admin** → access. It listens to the profile in real time, so approving/revoking takes effect without a refresh.
* Only approved users/admins get a server session (`POST /api/auth/session` verifies the ID token signature, audience, issuer and expiry
  against Google's public keys, then reads `users/{uid}` via the Firestore REST API with the user's own token — no service account needed).
  Server sessions last **1 hour** and are renewed while the user is approved, so a revocation reaches the server within the hour at the latest
  (the open tab is blocked immediately).
* `/admin` (admin role only, enforced by the server session *and* Firestore rules) has **User approvals** (Pending / Approved / Rejected,
  search, Approve / Reject / Revoke) and **Website reviews** (publishing approval).

## Features

* **Guided creation** (`/create`): wedding details (Sinhala/English) → template gallery with desktop + mobile live preview → site generated.
* **10 Sri Lankan-inspired templates** (`src/lib/site/templates.ts`); switch any time without losing content.
* **Click-to-edit visual editor** (`/editor`): three panels (sections · live canvas · context-aware inspector), inline typing,
  fonts / size / colour / alignment per element, image upload with focal-point + zoom + shape, section background photos,
  drag-and-drop section ordering, add / hide / delete sections, undo / redo, desktop / tablet / mobile preview, debounced autosave.
  On phones the panels become touch-friendly drawers / bottom sheet.
* **16 section types** incl. countdown, venue, Google Maps embed, schedule, parents, gallery, RSVP, guest wishes.
* **Theme panel**: 8 Sri Lankan colour palettes, custom colours, heading/body fonts (all with Sinhala fallbacks), corners, borders, ornaments, animation.
* **Publishing**: unique `/w/<slug>` URL (editable, validated, reserved words blocked), publish / update / unpublish.
  Draft and published versions are stored separately. **Admin approval**: a first publish waits for approval at `/admin`
  (disable with `REQUIRE_APPROVAL=false`); once approved, later updates go live immediately.
* **Guests**: public site is server-rendered (SEO metadata, Open Graph, JSON-LD), mobile-first, EN ⇄ සිං switch,
  RSVP (name, attendance, guest count, phone, wish) with honeypot + rate limiting, WhatsApp reply button, public wishes wall.
* **Dashboard**: status, preview, copy / share link, RSVP stats, recent responses, quick customisation, activity;
  `/dashboard/guests` lists responses, hides wishes, deletes, exports CSV.
* **Bilingual platform UI** (cookie-based, `t("English", "සිංහල")` helpers) with deterministic Sinhala date formatting.

## Architecture

```
src/app
  (auth)/login, register        server-rendered pages + RHF/Zod client forms
  (app)/dashboard, create, preview, admin   authenticated shell (server-side requireUser/requireAdmin)
  editor/                       full-screen builder
  w/[slug]/                     public site (dynamic, SEO)
  actions/                      server actions: auth, wedding (save/publish/slug/admin), rsvp
  api/upload, media/[name]      image upload (auth + same-origin + size/type checks) and serving
src/lib
  site/                         document model: types, zod schema, defaults, templates, fonts, helpers
  db.ts auth.ts weddings.ts     persistence + sessions; every query is scoped by the signed-in user's id
src/components
  site/                         SiteRenderer + sections (container-query responsive → same code in editor, thumbnails, public)
  editor/                       reducer with undo/redo + autosave, panels, image tools, publish dialog
```

A website is a single validated JSON document (`Doc`): `info` (bilingual wedding details), `theme`, ordered `sections`
(each with `props` + `style`) and per-element style overrides. `src/lib/site/schema.ts` validates every save on the server
(colour/font whitelists, safe URLs, own-media-only image sources, size caps).

## Tests

* `node --experimental-strip-types e2e/firebase-verify.test.mjs` — unit tests for ID-token verification and profile parsing (no Firebase needed).
* `e2e/invitation.cjs` — smoke test of the standalone template at `/invitation-demo`.
* `e2e/journey.cjs` / `e2e/mobile.cjs` — full Playwright journeys written against the previous email/password sign-up; the register/login
  and admin-login steps must be adapted to a Firebase project or the Firebase Emulator Suite before they run again.
