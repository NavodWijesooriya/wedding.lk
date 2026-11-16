"use server";
import { headers } from "next/headers";
import { z } from "zod";
import { rateLimit } from "@/lib/auth";
import { addRsvp, getPublicWedding } from "@/lib/weddings";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  attending: z.enum(["yes", "no", "maybe"]),
  guests: z.number().int().min(0).max(20),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(500).optional(),
  lang: z.enum(["en", "si"]).optional(),
  website: z.string().max(200).optional(), // honeypot
});

export async function submitRsvp(slug: string, input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  const si = (input as any)?.lang === "si";
  const m = (en: string, s: string) => (si ? s : en);
  if (!parsed.success) return { ok: false, error: m("Please enter your name and choose a response.", "කරුණාකර ඔබගේ නම ඇතුළත් කර පිළිතුරක් තෝරන්න.") };
  if (parsed.data.website) return { ok: true }; // bot — pretend success
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!rateLimit(`rsvp:${ip}:${slug}`, 6, 10 * 60_000)) return { ok: false, error: m("Too many submissions. Please try again later.", "වාර ගණන වැඩියි. පසුව නැවත උත්සාහ කරන්න.") };
  const w = getPublicWedding(slug);
  if (!w) return { ok: false, error: m("This invitation is not available.", "මෙම ආරාධනය ලබා ගත නොහැක.") };
  addRsvp(w.id, {
    name: parsed.data.name,
    attending: parsed.data.attending,
    guests: parsed.data.attending === "yes" ? Math.max(1, parsed.data.guests) : 0,
    phone: parsed.data.phone,
    message: parsed.data.message,
  });
  return { ok: true };
}
