import { z } from "zod";
import { FONTS } from "./fonts";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const l10n = z.object({ en: z.string().max(4000), si: z.string().max(4000) });
const fontKey = z.string().refine((k) => FONTS.some((f) => f.key === k), "Unknown font");
const short = z.string().max(300);

export const infoSchema = z.object({
  bride: l10n, groom: l10n,
  date: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/),
  time: z.string().regex(/^(\d{2}:\d{2})?$/),
  venueName: l10n, venueAddress: l10n, receptionName: l10n, receptionAddress: l10n,
  receptionTime: z.string().regex(/^(\d{2}:\d{2})?$/),
  brideParents: l10n, groomParents: l10n, message: l10n, story: l10n,
  phone: z.string().max(40), whatsapp: z.string().max(40), email: z.union([z.literal(""), z.string().email().max(120)]),
  mapUrl: z.string().max(500),
});

const theme = z.object({
  primary: hex, secondary: hex, bg: hex, text: hex, button: hex,
  headingFont: fontKey, bodyFont: fontKey,
  radius: z.enum(["sharp", "soft", "round"]), border: z.enum(["none", "thin", "double"]),
  ornament: z.enum(["lotus", "floral", "kandyan", "none"]), animation: z.enum(["none", "fade", "rise"]),
  heroLayout: z.enum(["center", "split", "arch", "full"]),
});

const section = z.object({
  id: z.string().regex(/^[\w-]{1,40}$/),
  type: z.enum(["hero","couple","story","message","countdown","datetime","venue","map","schedule","details","parents","gallery","rsvp","wishes","contact","footer"]),
  visible: z.boolean(),
  props: z.record(z.string(), z.any()),
  style: z.object({
    bg: hex.optional(), color: hex.optional(), overlay: z.number().min(0).max(90).optional(),
    padY: z.enum(["sm", "md", "lg"]).optional(), align: z.enum(["left", "center", "right"]).optional(),
    bgImage: z.any().optional(),
  }),
});

const elStyle = z.object({
  size: z.number().min(50).max(260).optional(), font: fontKey.optional(), color: hex.optional(), bg: hex.optional(),
  align: z.enum(["left", "center", "right"]).optional(), bold: z.boolean().optional(), italic: z.boolean().optional(),
});

export const docSchema = z.object({
  v: z.literal(1),
  template: z.string().max(40),
  lang: z.enum(["en", "si"]),
  title: short,
  info: infoSchema, theme,
  sections: z.array(section).max(60),
  styles: z.record(z.string().max(120), elStyle),
});

const MEDIA = /^\/media\/[\w-]+\.webp$/;
export const safeUrl = (u: string) => u === "" || /^(https?:\/\/|mailto:|tel:|#|\/)/i.test(u.trim());

/** Walks arbitrary prop JSON: image srcs must be our own media; urls must be safe. */
function walk(v: any, key = "", depth = 0): string | null {
  if (depth > 8) return "too deep";
  if (typeof v === "string") {
    if (v.length > 6000) return "string too long";
    if (key === "src" && v !== "" && !MEDIA.test(v)) return "bad image source";
    if (/href|url/i.test(key) && !safeUrl(v)) return "bad url";
  } else if (Array.isArray(v)) {
    if (v.length > 80) return "list too long";
    for (const x of v) { const e = walk(x, key, depth + 1); if (e) return e; }
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) { const e = walk(x, k, depth + 1); if (e) return e; }
  }
  return null;
}

export function validateDoc(input: unknown): { ok: true; doc: z.infer<typeof docSchema> } | { ok: false; error: string } {
  const r = docSchema.safeParse(input);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.path.join(".") + ": " + r.error.issues[0]?.message };
  const e = walk(r.data);
  if (e) return { ok: false, error: e };
  if (JSON.stringify(r.data).length > 600_000) return { ok: false, error: "Website is too large" };
  return { ok: true, doc: r.data };
}
