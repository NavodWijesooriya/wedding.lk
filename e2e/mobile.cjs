// Mobile / touch smoke test of the editor and public page, plus Sinhala rendering. Run after journey.cjs has created data.
const { chromium, devices } = require("playwright");
const path = require("path");
const BASE = process.env.BASE || "http://localhost:3100";
const SHOTS = process.env.SHOTS || path.join(__dirname, "shots");
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices["iPhone 13"], hasTouch: true });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && !/fonts|ERR_|Failed to load resource/.test(m.text()) && errs.push(m.text()));
  const email = `m${Date.now()}@example.com`;
  await p.goto(BASE + "/register"); await p.fill("#name", "Mobile User"); await p.fill("#email", email); await p.fill("#password", "secret-pass-3");
  await p.getByRole("button", { name: /Create my account/ }).click(); await p.waitForURL("**/dashboard");
  // Sinhala UI
  await p.getByRole("button", { name: "සිංහල" }).first().click(); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(SHOTS, "m1-dashboard-si.png") });
  await p.goto(BASE + "/create"); await p.waitForSelector("#f-bride");
  await p.getByRole("button", { name: "සිංහල" }).last().click().catch(() => {});
  await p.fill("#f-bride", "සඳුනි"); await p.fill("#f-groom", "කවීන්දු"); await p.fill("#f-date", "2027-05-01");
  await p.fill("#f-venueName", "මවුන්ට් ලැවීනියා හෝටලය");
  await p.screenshot({ path: path.join(SHOTS, "m2-wizard-si.png"), fullPage: false });
  await p.locator("form[novalidate]").evaluate((f) => f.requestSubmit());
  await p.getByRole("heading", { level: 1 }).filter({ hasText: "සැලසුම" }).waitFor();
  await p.locator("li", { hasText: "සිංහල සංස්කෘතික" }).getByRole("button").last().click();
  await p.waitForURL("**/editor"); await p.waitForSelector("[data-el]"); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(SHOTS, "m3-editor.png") });
  await p.locator('[data-editable]').first().tap(); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(SHOTS, "m4-editor-sheet.png") });
  await p.getByRole("button", { name: /^(Done|අවසන්)$/ }).tap().catch(() => {});
  await p.getByRole("button", { name: /Close panel/ }).click({ force: true }).catch(() => {});
  await p.getByRole("button", { name: /Theme|තේමාව/ }).last().tap(); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(SHOTS, "m5-editor-drawer.png") });
  const ow = await p.evaluate(() => document.documentElement.scrollWidth); console.log("scrollWidth", ow);
  console.log("errors:", [...new Set(errs)]);
  await b.close();
})();
