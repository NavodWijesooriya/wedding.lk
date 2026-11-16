# Wedding.lk — Sri Lankan wedding invitation website builder

A Next.js (App Router, TypeScript, Tailwind CSS v4) platform where couples create, edit, preview and publish a
Sinhala / English wedding invitation website without writing code.

> **Note on "existing" systems.** The repository was empty when this work started (only a README), so there was no
> existing database, auth or storage to reuse. This project therefore ships self-contained implementations that run
> with zero external services. Each sits behind a small module so it can be swapped for a hosted service:
>
> | Concern | Implementation | Swap point |
> |---|---|---|
> | Database | SQLite via Node's built-in `node:sqlite` (Node ≥ 22.13) | `src/lib/db.ts`, `src/lib/weddings.ts` |
> | Auth | Email + password (scrypt), hashed server-side session tokens in an `httpOnly` cookie | `src/lib/auth.ts`, `src/app/actions/auth.ts` |
> | Image storage | Local disk (`DATA_DIR/uploads`), resized + converted to WebP with `sharp`, served from `/media/*` | `src/app/api/upload`, `src/app/media` |

## Run it

```bash
cp .env.example .env.local   # optional
npm install
npm run dev                  # or: npm run build && npm start
```

First start creates an admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`, defaults `admin@wedding.lk` / `admin12345` — **change these**).
Persist `DATA_DIR` in production (it holds the database and uploads). Behind plain HTTP set `INSECURE_COOKIES=1`.

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

`e2e/journey.cjs` drives the full journey with Playwright against a running server (register → wizard → template →
inline edit → styling → uploads → sections → Sinhala → devices → autosave/persistence → publish → admin approval →
public page → guest RSVP → dashboard → unpublish/republish → authorization checks). `e2e/mobile.cjs` is a phone/Sinhala smoke test.

```bash
npm run build && DATA_DIR=/tmp/wl INSECURE_COOKIES=1 npm start -- -p 3100 &
BASE=http://localhost:3100 node e2e/journey.cjs
```
