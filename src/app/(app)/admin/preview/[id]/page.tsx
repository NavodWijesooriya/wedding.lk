import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getWeddingById } from "@/lib/weddings";
import { PreviewFrame } from "@/components/PreviewFrame";

export const metadata = { title: "Review website", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const w = getWeddingById((await params).id);
  if (!w) notFound();
  return <div className="fixed inset-0 z-50 bg-white"><PreviewFrame doc={w.publishedDoc ?? w.doc} back="/admin" note={`Admin review · ${w.slug} · ${w.publishedDoc ? "submitted version" : "draft"}`} /></div>;
}
