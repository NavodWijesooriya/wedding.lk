"use client";
import { useState, type CSSProperties } from "react";
import type { Doc, Lang, Section, Wish } from "@/lib/site/types";
import { fontStack, fontsUrl } from "@/lib/site/fonts";
import { FONTS } from "@/lib/site/fonts";
import { hexA, isDark } from "@/lib/site/util";
import { Ctx, type EditApi } from "./context";
import { Contact, Countdown, DateTime, Details, Footer, Gallery, Hero, MapSec, Message, Parents, Rsvp, Schedule, Story, Venue, Wishes, Couple } from "./sections";

const MAP: Record<Section["type"], (p: { s: Section; alt: boolean }) => React.ReactNode> = {
  hero: Hero, couple: Couple, story: Story, message: Message, countdown: Countdown, datetime: DateTime, venue: Venue, map: MapSec,
  schedule: Schedule, details: Details, parents: Parents, gallery: Gallery, rsvp: Rsvp, wishes: Wishes, contact: Contact, footer: Footer,
};

const RADIUS = { sharp: ["0px", "0px", "0px"], soft: ["6px", "14px", "22px"], round: ["12px", "26px", "40px"] } as const;

export function themeVars(doc: Doc): CSSProperties {
  const t = doc.theme;
  const [sm, md, lg] = RADIUS[t.radius];
  return {
    ["--primary" as any]: t.primary, ["--secondary" as any]: t.secondary, ["--bg" as any]: t.bg, ["--text" as any]: t.text, ["--button" as any]: t.button,
    ["--button-text" as any]: isDark(t.button) ? "#ffffff" : "#1c1917",
    ["--r-sm" as any]: sm, ["--r-md" as any]: md, ["--r-lg" as any]: lg,
    ["--font-heading" as any]: fontStack(t.headingFont), ["--font-body" as any]: fontStack(t.bodyFont, "lato"),
    ["--card-bg" as any]: `color-mix(in srgb, var(--bg) 82%, ${isDark(t.bg) ? "white" : "var(--primary)"} ${isDark(t.bg) ? 7 : 5}%)`,
    ["--card-border" as any]: t.border === "none" ? "transparent" : hexA(t.secondary, 0.55),
    background: t.bg, color: t.text,
  };
}

export function usedFonts(doc: Doc): string[] {
  return [doc.theme.headingFont, doc.theme.bodyFont, ...Object.values(doc.styles).map((s) => s.font).filter(Boolean) as string[]];
}

export function allFontsUrl() {
  return fontsUrl(FONTS.map((f) => f.key));
}

export function SiteRenderer({ doc, lang: langProp, edit = null, wishes = [], slug, live = false, animate = false, showLangSwitch = false, thumb = false, className = "" }: {
  doc: Doc; lang?: Lang; edit?: EditApi | null; wishes?: Wish[]; slug?: string; live?: boolean; animate?: boolean; showLangSwitch?: boolean; thumb?: boolean; className?: string;
}) {
  const [guestLang, setGuestLang] = useState<Lang | null>(null);
  const lang = langProp ?? guestLang ?? doc.lang;
  const visible = doc.sections.filter((s) => s.visible);
  const fonts = fontsUrl(edit ? FONTS.map((f) => f.key) : usedFonts(doc));
  return (
    <Ctx.Provider value={{ doc, lang, edit, wishes, slug, animate, live, thumb }}>
      {fonts && <link rel="stylesheet" href={fonts} precedence="default" />}
      <div className={`site @container relative ${edit ? "site-editing" : ""} ${className}`} data-border={doc.theme.border} style={themeVars(doc)} lang={lang} data-theme-anim={doc.theme.animation}>
        {showLangSwitch && !edit && (
          <div className="absolute right-3 top-3 z-20 flex rounded-full p-0.5 text-xs shadow-md backdrop-blur" style={{ background: hexA(doc.theme.bg, 0.85), border: `1px solid ${hexA(doc.theme.secondary, 0.5)}` }} role="group" aria-label="Language">
            {(["en", "si"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setGuestLang(l)} aria-pressed={lang === l} className="rounded-full px-3 py-1.5 font-medium transition" style={lang === l ? { background: "var(--primary)", color: "var(--bg)" } : { color: "var(--text)" }}>
                {l === "en" ? "EN" : "සිං"}
              </button>
            ))}
          </div>
        )}
        {visible.map((s, i) => {
          const C = MAP[s.type];
          return <C key={s.id} s={s} alt={i % 2 === 1} />;
        })}
        {visible.length === 0 && (
          <div className="flex min-h-[50vh] items-center justify-center p-10 text-center opacity-60">
            {lang === "si" ? "කොටස් නොමැත. වම් පැත්තෙන් කොටසක් එක් කරන්න." : "No sections yet. Add one from the left panel."}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
