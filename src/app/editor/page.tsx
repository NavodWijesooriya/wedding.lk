import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { getWeddingByUser } from "@/lib/weddings";
import { Editor } from "@/components/editor/Editor";
import { ApprovalGuard } from "@/components/ApprovalGuard";

export const metadata = { title: "Website editor", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ panel?: string }> }) {
  const user = await requireUser();
  const w = getWeddingByUser(user.id);
  if (!w) redirect("/create");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
  return <ApprovalGuard><Editor initialDoc={w.doc} initialState={{ status: w.status, approval: w.approval, slug: w.slug, note: w.approvalNote }} origin={origin} initialPanel={(await searchParams).panel} /></ApprovalGuard>;
}
