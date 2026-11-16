"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertUser } from "@/lib/auth";
import { buildDoc } from "@/lib/site/defaults";
import { infoSchema, validateDoc } from "@/lib/site/schema";
import { getTemplate } from "@/lib/site/templates";
import {
  createWedding, deleteRsvp, getWeddingByUser, publish, saveDoc, setSlug, setWishVisible, slugAvailable, unpublish, validSlug,
} from "@/lib/weddings";
import { adminSetApproval } from "@/lib/weddings";
import { getUser } from "@/lib/auth";

const createSchema = z.object({ info: infoSchema, template: z.string().max(40), lang: z.enum(["en", "si"]) });

export async function createSiteAction(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await assertUser();
  const p = createSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Please check the highlighted fields." };
  if (getWeddingByUser(user.id)) return { ok: true };
  const doc = buildDoc(p.data.info, getTemplate(p.data.template).id, p.data.lang);
  const v = validateDoc(doc);
  if (!v.ok) return { ok: false, error: v.error };
  createWedding(user.id, v.doc as any);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function saveDocAction(input: unknown): Promise<{ ok: true; version: number; updatedAt: number } | { ok: false; error: string }> {
  const user = await assertUser();
  const v = validateDoc(input);
  if (!v.ok) return { ok: false, error: v.error };
  const r = saveDoc(user.id, v.doc as any);
  if (!r) return { ok: false, error: "No website found" };
  return { ok: true, ...r };
}

export type PublishState = { status: string; approval: string; slug: string; note: string | null };

export async function publishAction(): Promise<{ ok: true; state: PublishState } | { ok: false; error: string }> {
  const user = await assertUser();
  const w = getWeddingByUser(user.id);
  if (!w) return { ok: false, error: "No website found" };
  const { bride, groom } = w.doc.info;
  if (!(bride.en || bride.si) || !(groom.en || groom.si)) return { ok: false, error: "missing_names" };
  const r = publish(user.id)!;
  revalidatePath(`/w/${r.slug}`);
  revalidatePath("/dashboard");
  return { ok: true, state: { status: r.status, approval: r.approval, slug: r.slug, note: r.approvalNote } };
}

export async function unpublishAction(): Promise<{ ok: true; state: PublishState } | { ok: false; error: string }> {
  const user = await assertUser();
  const r = unpublish(user.id);
  if (!r) return { ok: false, error: "No website found" };
  revalidatePath(`/w/${r.slug}`);
  revalidatePath("/dashboard");
  return { ok: true, state: { status: r.status, approval: r.approval, slug: r.slug, note: r.approvalNote } };
}

export async function checkSlugAction(slug: string): Promise<{ ok: boolean; error?: string }> {
  const user = await assertUser();
  const w = getWeddingByUser(user.id);
  const s = String(slug).toLowerCase();
  const bad = validSlug(s);
  if (bad) return { ok: false, error: bad };
  if (!slugAvailable(s, w?.id)) return { ok: false, error: "That address is already taken." };
  return { ok: true };
}

export async function setSlugAction(slug: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await assertUser();
  const old = getWeddingByUser(user.id)?.slug;
  const err = setSlug(user.id, String(slug).toLowerCase());
  if (err) return { ok: false, error: err };
  if (old) revalidatePath(`/w/${old}`);
  revalidatePath(`/w/${slug}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function wishVisibilityAction(id: string, show: boolean) {
  const user = await assertUser();
  setWishVisible(user.id, String(id), !!show);
  const w = getWeddingByUser(user.id);
  if (w) revalidatePath(`/w/${w.slug}`);
  revalidatePath("/dashboard/guests");
}

export async function deleteRsvpAction(id: string) {
  const user = await assertUser();
  deleteRsvp(user.id, String(id));
  const w = getWeddingByUser(user.id);
  if (w) revalidatePath(`/w/${w.slug}`);
  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
}

export async function adminAction(id: string, action: "approve" | "reject" | "suspend", note?: string) {
  const user = await getUser();
  if (!user || user.role !== "admin") return { ok: false as const, error: "Forbidden" };
  const ok = adminSetApproval(String(id), action, note?.slice(0, 300));
  revalidatePath("/admin");
  return ok ? { ok: true as const } : { ok: false as const, error: "Not found" };
}
