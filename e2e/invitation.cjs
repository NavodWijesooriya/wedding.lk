// Smoke test for the standalone ModernInvitation template at /invitation-demo.
const { chromium } = require("playwright");
const path = require("path");
const BASE = process.env.BASE || "http://localhost:3100";
const SHOTS = process.env.SHOTS || path.join(__dirname, "shots");
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const [name, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const p = await (await b.newContext({ viewport: vp })).newPage(); p.setDefaultTimeout(8000);
    p.on("pageerror", (e) => errs.push(name + ": " + e.message));
    await p.goto(BASE + "/invitation-demo"); await p.waitForTimeout(1200);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth); if (sw > vp.width + 1) errs.push(`${name}: overflow ${sw}`);
    const t = await p.locator('[role=timer]').innerText(); if (/––/.test(t)) errs.push("countdown not ticking");
    await p.screenshot({ path: path.join(SHOTS, `inv-${name}-hero.png`) });
    await p.locator("#rsvp").scrollIntoViewIfNeeded();
    await p.getByRole("button", { name: /Send RSVP/ }).click();
    await p.getByText("Please enter your full name.").waitFor();
    await p.getByText("Please enter a valid email address.").waitFor();
    await p.fill("#rsvp-name", "Nimal Silva"); await p.fill("#rsvp-email", "nimal@example.com"); await p.selectOption("#rsvp-meal", "Fish");
    await p.fill("#rsvp-msg", "Congratulations!");
    await p.screenshot({ path: path.join(SHOTS, `inv-${name}-rsvp.png`) });
    await p.getByRole("button", { name: /Send RSVP/ }).click();
    await p.getByRole("status").getByText(/can't wait/).waitFor();
    await p.getByRole("button", { name: /music/i }).click();
    await p.locator("#gallery").scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
    await p.screenshot({ path: path.join(SHOTS, `inv-${name}-gallery.png`) });
    await p.locator("#story").scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
    await p.screenshot({ path: path.join(SHOTS, `inv-${name}-story.png`) });
  }
  console.log(errs.length ? "ERRORS:\n" + errs.join("\n") : "invitation smoke test passed");
  await b.close();
})();
