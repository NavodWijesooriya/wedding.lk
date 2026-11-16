// End-to-end journey: register → wizard → editor → publish → admin approval → guest RSVP → dashboard.
// Usage: BASE=http://localhost:3100 SHOTS=/some/dir node e2e/journey.cjs
const { chromium } = require("playwright");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const BASE = process.env.BASE || "http://localhost:3100";
const SHOTS = process.env.SHOTS || path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const email = `couple${Date.now()}@example.com`;
const results = [];
const step = async (name, fn) => {
  try { await fn(); results.push(["PASS", name]); console.log("PASS", name); }
  catch (e) { results.push(["FAIL", name, e.message.split("\n")[0]]); console.log("FAIL", name, "\n   ", e.message.split("\n").slice(0, 3).join("\n    ")); }
};

(async () => {
  const img = path.join(SHOTS, "test-photo.png");
  await sharp({ create: { width: 1800, height: 1200, channels: 3, background: { r: 200, g: 120, b: 90 } } })
    .composite([{ input: Buffer.from('<svg width="1800" height="1200"><circle cx="900" cy="500" r="300" fill="#f5d9a8"/><rect x="700" y="700" width="400" height="500" fill="#7a1f2b"/></svg>'), top: 0, left: 0 }]).png().toFile(img);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  const watch = (p, l) => p.on("pageerror", (e) => errors.push(`[${l}] ${p.url()} pageerror: ` + e.message.slice(0, 90)));
  watch(page, "user");
  page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errors.push("console: " + m.text()); });
  const shot = (n) => page.screenshot({ path: path.join(SHOTS, n + ".png") });

  await step("1 landing page renders", async () => { await page.goto(BASE); await page.getByRole("heading", { level: 1 }).first().waitFor(); await shot("01-landing"); });
  await step("2 register", async () => {
    await page.goto(BASE + "/register");
    await page.fill("#name", "Test Couple"); await page.fill("#email", email); await page.fill("#password", "secret-pass-1");
    await page.getByRole("button", { name: /Create my account/ }).click();
    await page.waitForURL("**/dashboard");
    await page.getByText("Create my website").waitFor();
    await shot("02-dashboard-empty");
  });
  await step("3 wizard validation blocks empty form", async () => {
    await page.getByText("Create my website").click(); await page.waitForURL("**/create");
    await page.getByRole("button", { name: /Continue to designs/ }).click();
    await page.getByText("Please choose the wedding date").waitFor();
  });
  await step("4 wizard details → template → site created", async () => {
    await page.fill("#f-bride", "Sanduni"); await page.fill("#f-groom", "Kavindu");
    await page.fill("#f-date", "2027-03-20"); await page.fill("#f-time", "09:45");
    await page.fill("#f-venueName", "Mount Lavinia Hotel"); await page.fill("#f-venueAddress", "Hotel Rd, Mount Lavinia");
    await page.fill("#f-brideParents", "Mr. & Mrs. Perera"); await page.fill("#f-groomParents", "Mr. & Mrs. Fernando");
    await page.fill("#f-phone", "+94 77 123 4567"); await page.fill("#f-wa", "+94771234567");
    await shot("03-wizard-details");
    await page.getByRole("button", { name: /Continue to designs/ }).click();
    await page.getByRole("heading", { name: "Choose your design" }).waitFor();
    await page.waitForTimeout(800); await shot("04-wizard-templates");
    // live preview of a template
    await page.getByRole("button", { name: /Live preview: Lotus/ }).click();
    await page.waitForTimeout(600); await shot("05-template-preview");
    await page.getByRole("button", { name: /Mobile/ }).last().click(); await page.waitForTimeout(500); await shot("05b-template-preview-mobile");
    await page.getByRole("button", { name: "Close" }).click();
    await page.locator("li", { hasText: "Traditional Kandyan" }).getByRole("button", { name: /Select & customize|Selected/ }).click();
    await page.waitForURL("**/editor", { timeout: 20000 });
    await page.waitForSelector("[data-el]");
    await page.waitForTimeout(800); await shot("06-editor-initial");
  });
  await step("5 click-to-edit bride name inline + persists in panel", async () => {
    const h = page.locator('[data-label="Bride\'s name"]').first();
    await h.click();
    await page.getByRole("heading", { name: "Bride's name" }).first().waitFor();
    await page.keyboard.press("Control+A"); await page.keyboard.type("Sanduni Perera");
    await page.waitForFunction(() => [...document.querySelectorAll("textarea,input")].some((i) => i.value === "Sanduni Perera"));
    await shot("07-editor-name-selected");
  });
  await step("6 change font, size and colour of the name", async () => {
    await page.getByLabel("Font", { exact: true }).selectOption("script");
    await page.getByRole("slider", { name: "Size" }).fill("140");
    const hex = page.getByLabel("Text colour hex"); await hex.fill("#b8893b");
    await page.waitForTimeout(300);
    const st = await page.locator('[data-label="Bride\'s name"]').first().evaluate((e) => ({ f: getComputedStyle(e).fontFamily, c: getComputedStyle(e).color }));
    if (!/Great Vibes/.test(st.f) || st.c !== "rgb(184, 137, 59)") throw new Error("style not applied " + JSON.stringify(st));
    await shot("08-editor-styled");
  });
  await step("7 edit date via panel", async () => {
    await page.locator('[data-label="Wedding date"]').first().click();
    await page.locator('input[type=date]').first().fill("2027-04-10");
    await page.getByText("10 April 2027").first().waitFor();
  });
  await step("8 hero: upload cover photo", async () => {
    await page.locator('[data-section]').first().click({ position: { x: 20, y: 40 } });
    await page.getByRole("heading", { name: /Cover|hero/i }).first().waitFor();
    await page.locator('input[type=file]').first().setInputFiles(img);
    await page.waitForSelector('[data-section] img[src^="/media/"]', { timeout: 15000 });
    await shot("09-editor-image");
  });
  await step("9 theme: palette + heading font + template switch keeps info", async () => {
    await page.getByRole("tab", { name: /Theme/ }).click();
    await page.getByRole("button", { name: /Lotus Blush/ }).click();
    await page.getByRole("button", { name: /Change template/ }).click();
    await page.locator('[role=dialog] li', { hasText: "Luxury Dark" }).getByRole("button", { name: /Use this template/ }).click();
    await page.waitForTimeout(500);
    const txt = await page.locator(".site").innerText();
    if (!/Sanduni Perera/.test(txt) || !/Kavindu/.test(txt)) throw new Error("info lost after template switch");
    await shot("10-editor-dark-template");
  });
  await step("10 add / hide / reorder / delete sections", async () => {
    await page.getByRole("tab", { name: /Sections/ }).click();
    const before = await page.locator('ul[aria-label="Website sections"] > li').count();
    await page.getByRole("button", { name: /Add section/ }).click();
    await page.getByRole("button", { name: /Our Love Story/ }).click();
    if ((await page.locator('ul[aria-label="Website sections"] > li').count()) !== before + 1) throw new Error("add failed");
    // reorder with arrow
    const first = await page.locator('ul[aria-label="Website sections"] > li').first().innerText();
    await page.getByRole("button", { name: /Move down: Cover/ }).click();
    const first2 = await page.locator('ul[aria-label="Website sections"] > li').first().innerText();
    if (first === first2) throw new Error("reorder failed");
    await page.getByRole("button", { name: /Move up: Cover/ }).click();
    // hide countdown
    await page.getByRole("button", { name: /Hide: Countdown/ }).click();
    if (await page.locator('.site section[id^="countdown"]').count()) throw new Error("hidden section still shown");
    // delete
    await page.getByRole("button", { name: /Delete: Contact/ }).click({ force: true });
    await page.getByRole("dialog").getByRole("button", { name: "Delete section" }).click();
    if ((await page.locator('ul[aria-label="Website sections"] > li').count()) !== before) throw new Error("delete failed");
    await shot("11-editor-sections");
  });
  await step("11 drag-and-drop reorder", async () => {
    const items = page.locator('ul[aria-label="Website sections"] > li');
    const a = await items.nth(2).innerText();
    await items.nth(2).dragTo(items.nth(4));
    const b = await items.nth(2).innerText();
    if (a === b) throw new Error("dnd did not reorder");
  });
  await step("12 schedule editing + gallery upload", async () => {
    await page.getByRole("button", { name: /^Schedule$/ }).click();
    await page.getByRole("button", { name: /Add$/ }).click();
    await page.getByRole("button", { name: /^Gallery$/ }).click();
    await page.locator('input[type=file][multiple]').setInputFiles([img, img]);
    await page.waitForFunction(() => document.querySelectorAll('.site section img[src^="/media/"]').length >= 3, null, { timeout: 20000 });
    await shot("12-editor-gallery");
  });
  await step("13 switch to Sinhala and edit Sinhala text", async () => {
    await page.getByRole("button", { name: "සිං" }).first().click();
    await page.waitForTimeout(400);
    const t = await page.locator(".site").first().getAttribute("lang");
    if (t !== "si") throw new Error("canvas not Sinhala");
    await page.locator('[data-label="Bride\'s name"]').first().click();
    await page.keyboard.press("Control+A"); await page.keyboard.type("සඳුනි");
    await page.waitForTimeout(300);
    await shot("13-editor-sinhala");
    await page.getByRole("button", { name: "EN", exact: true }).first().click();
    const t2 = await page.locator('[data-label="Bride\'s name"]').first().innerText();
    if (!/Sanduni/.test(t2)) throw new Error("English name lost: " + t2);
  });
  await step("14 device previews (tablet / mobile)", async () => {
    await page.getByRole("button", { name: "Mobile" }).first().click(); await page.waitForTimeout(500);
    const w = await page.locator(".site").first().evaluate((e) => e.getBoundingClientRect().width);
    if (Math.abs(w - 390) > 2) throw new Error("mobile width " + w);
    await shot("14-editor-mobile");
    await page.getByRole("button", { name: "Tablet" }).first().click(); await page.waitForTimeout(400); await shot("14b-editor-tablet");
    await page.getByRole("button", { name: "Desktop" }).first().click();
  });
  await step("15 autosave + persistence after reload", async () => {
    await page.getByText("All changes saved").first().waitFor({ timeout: 10000 });
    await page.reload(); await page.waitForSelector("[data-el]"); await page.waitForTimeout(600);
    const txt = await page.locator(".site").innerText();
    if (!/Sanduni Perera/.test(txt)) throw new Error("name not persisted");
    if (!(await page.locator('.site section img[src^="/media/"]').count())) throw new Error("images not persisted");
    const hasSi = await page.evaluate(async () => (await (await fetch("/editor")).text()).includes("සඳුනි"));
    if (!hasSi) throw new Error("Sinhala name not persisted");
  });
  await step("16 preview page", async () => {
    const p2 = await ctx.newPage(); await p2.goto(BASE + "/preview"); await p2.waitForSelector(".site"); await p2.screenshot({ path: path.join(SHOTS, "15-preview.png") }); await p2.close();
  });
  let slug = "";
  await step("17 publish → pending approval, public URL not yet live", async () => {
    await page.getByRole("button", { name: /^Publish$/ }).click();
    await page.getByRole("dialog").getByRole("button", { name: /Publish website/ }).click();
    await page.getByText(/Waiting for approval/).waitFor();
    slug = await page.locator("#slug").inputValue();
    await shot("16-publish-pending");
    const r = await ctx.request.get(`${BASE}/w/${slug}`);
    if (r.status() !== 404) throw new Error("public page should be 404 before approval, got " + r.status());
  });
  await step("18 admin approves", async () => {
    const actx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const ap = await actx.newPage(); watch(ap, "admin");
    await ap.goto(BASE + "/login"); await ap.fill("#email", "admin@wedding.lk"); await ap.fill("#password", process.env.ADMIN_PASSWORD || "admin12345");
    await ap.getByRole("button", { name: "Sign in" }).click(); await ap.waitForURL("**/admin");
    const row = ap.getByTestId(`admin-row-${slug}`); await row.waitFor();
    await ap.screenshot({ path: path.join(SHOTS, "17-admin.png") });
    await row.getByRole("button", { name: /Approve/ }).click();
    await ap.getByTestId(`admin-row-${slug}`).getByText("approved").waitFor();
    await actx.close();
  });
  await step("19 public site live (SEO + content)", async () => {
    const gctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const gp = await gctx.newPage(); watch(gp, "guest");
    await gp.goto(`${BASE}/w/${slug}`); await gp.waitForSelector(".site");
    const html = await gp.content();
    if (!/Sanduni Perera/.test(html)) throw new Error("names missing in HTML");
    const title = await gp.title(); if (!/Sanduni Perera/.test(title)) throw new Error("title " + title);
    if (!/og:title/.test(html) || !/application\/ld\+json/.test(html)) throw new Error("meta missing");
    const sw = await gp.evaluate(() => document.documentElement.scrollWidth); if (sw > 392) throw new Error("horizontal overflow " + sw);
    await gp.screenshot({ path: path.join(SHOTS, "18-public-mobile.png"), fullPage: false });
    // 20 guest RSVP
    await gp.locator("#rsvp").scrollIntoViewIfNeeded();
    await gp.locator('form input:not([name=website]):not([type=radio])').first().fill("Nimal Silva");
    await gp.getByText("Joyfully accept").click();
    await gp.locator("select").selectOption("3");
    await gp.locator("textarea").fill("Wishing you a lifetime of happiness!");
    await gp.getByRole("button", { name: /Send RSVP/ }).click();
    await gp.getByText(/Thank you/).waitFor();
    await gp.screenshot({ path: path.join(SHOTS, "19-public-rsvp-done.png") });
    await gp.reload(); await gp.getByText("Wishing you a lifetime of happiness!").first().waitFor();
    // language switch for guests
    await gp.getByRole("button", { name: "සිං" }).click(); await gp.waitForTimeout(400);
    await gp.screenshot({ path: path.join(SHOTS, "20-public-sinhala.png") });
    await gctx.close();
  });
  await step("21 dashboard shows RSVP stats + guests page", async () => {
    await page.goto(BASE + "/dashboard");
    await page.getByTestId("status-badge").getByText("Live").waitFor();
    await page.getByText("Nimal Silva").first().waitFor();
    if ((await page.getByTestId("stat-Attending").innerText()) !== "1") throw new Error("stat wrong");
    await shot("21-dashboard");
    await page.goto(BASE + "/dashboard/guests"); await page.getByText("Nimal Silva").waitFor(); await shot("22-guests");
  });
  await step("22 unpublish → 404, republish → instantly live (already approved)", async () => {
    await page.goto(BASE + "/dashboard");
    await page.getByRole("button", { name: /Manage publishing/ }).click();
    await page.getByRole("button", { name: "Unpublish" }).click();
    await page.getByText(/private draft/).waitFor();
    if ((await ctx.request.get(`${BASE}/w/${slug}`)).status() !== 404) throw new Error("still public");
    await page.getByRole("button", { name: /Publish website/ }).click();
    await page.getByText(/Guests can open your invitation/).waitFor();
    if ((await ctx.request.get(`${BASE}/w/${slug}`)).status() !== 200) throw new Error("not live again");
  });
  await step("23 data isolation: other user cannot see or edit someone else's site", async () => {
    const octx = await browser.newContext(); const op = await octx.newPage();
    await op.goto(BASE + "/register"); await op.fill("#name", "Other"); await op.fill("#email", `o${Date.now()}@example.com`); await op.fill("#password", "secret-pass-2");
    await op.getByRole("button", { name: /Create my account/ }).click(); await op.waitForURL("**/dashboard");
    await op.goto(BASE + "/editor"); await op.waitForURL("**/create");
    await op.goto(BASE + "/admin"); await op.waitForURL("**/dashboard");
    const up = await octx.request.post(BASE + "/api/upload", { multipart: {} });
    if (up.status() === 500) throw new Error("upload 500");
    const anon = await browser.newContext(); const ar = await anon.request.post(BASE + "/api/upload", { multipart: { file: { name: "x.png", mimeType: "image/png", buffer: fs.readFileSync(img) } } });
    if (ar.status() !== 401) throw new Error("anon upload allowed: " + ar.status());
    await octx.close(); await anon.close();
  });

  if (errors.length) { console.log("Browser errors:\n" + [...new Set(errors)].join("\n")); }
  await browser.close();
  const failed = results.filter((r) => r[0] === "FAIL");
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})();
