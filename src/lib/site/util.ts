import type { Doc, ImageRef, L10n, Lang, Section } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 9);

/** Resolve a localized value with fallback to the other language. */
export function tr(v: L10n | string | undefined | null, lang: Lang): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return (v[lang] || v[lang === "en" ? "si" : "en"] || "").toString();
}

export function isL10n(v: unknown): v is L10n {
  return !!v && typeof v === "object" && "en" in (v as any) && "si" in (v as any);
}

/** Path access. Segments that hit an array resolve by `id` (or numeric index). */
export function getAt(obj: any, path: string): any {
  let cur = obj;
  for (const seg of path.split(".")) {
    if (cur == null) return undefined;
    if (Array.isArray(cur)) cur = cur.find((x) => x?.id === seg) ?? cur[Number(seg)];
    else cur = cur[seg];
  }
  return cur;
}

/** Immutable set. */
export function setAt<T>(obj: T, path: string, value: any): T {
  const segs = path.split(".");
  const rec = (cur: any, i: number): any => {
    if (i === segs.length) return value;
    const seg = segs[i];
    if (Array.isArray(cur)) {
      let idx = cur.findIndex((x) => x?.id === seg);
      if (idx < 0) idx = Number(seg);
      if (!(idx >= 0)) return cur;
      const next = cur.slice();
      next[idx] = rec(cur[idx], i + 1);
      return next;
    }
    const base = cur ?? {};
    return { ...base, [seg]: rec(base[seg], i + 1) };
  };
  return rec(obj, 0);
}

export const sectionOf = (doc: Doc, id: string): Section | undefined => doc.sections.find((s) => s.id === id);

const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  si: ["ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි", "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"],
};
const DAYS = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  si: ["ඉරිදා", "සඳුදා", "අඟහරුවාදා", "බදාදා", "බ්‍රහස්පතින්දා", "සිකුරාදා", "සෙනසුරාදා"],
};

// Deterministic (no Intl locale data) so server and browser always render identical text.
export function formatDate(date: string, lang: Lang): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return "";
  const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
  if (mo < 0 || mo > 11) return "";
  return lang === "si" ? `${y} ${MONTHS.si[mo]} ${d}` : `${d} ${MONTHS.en[mo]} ${y}`;
}

export function formatWeekday(date: string, lang: Lang): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  return DAYS[lang][new Date(`${date}T00:00:00Z`).getUTCDay()];
}

export function formatTime(time: string, lang: Lang): string {
  const m = /^(\d{2}):(\d{2})$/.exec(time || "");
  if (!m) return "";
  const h = Number(m[1]);
  const mm = m[2];
  const h12 = h % 12 === 0 ? 12 : h % 12;
  if (lang === "si") return `${h < 12 ? "පෙ.ව." : "ප.ව."} ${h12}.${mm}`;
  return `${h12}:${mm} ${h < 12 ? "AM" : "PM"}`;
}

export const hasImage = (i: ImageRef | undefined): i is NonNullable<ImageRef> => !!i && !!i.src;

export function mediaSrcSet(src: string) {
  if (!/^\/media\/[\w-]+\.webp$/.test(src)) return undefined;
  const small = src.replace(".webp", "-s.webp");
  return `${small} 640w, ${src} 1600w`;
}

/** Hex color helpers */
export function isDark(hex: string): boolean {
  const m = /^#?([\da-f]{6})$/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

export function hexA(hex: string, a: number): string {
  const m = /^#?([\da-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export function timeAgo(ms: number, lang: Lang): string {
  const diff = ms - Date.now();
  const rtf = new Intl.RelativeTimeFormat(lang === "si" ? "si-LK" : "en", { numeric: "auto" });
  const abs = Math.abs(diff);
  if (abs < 60_000) return rtf.format(0, "second");
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), "minute");
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), "hour");
  return rtf.format(Math.round(diff / 86_400_000), "day");
}
