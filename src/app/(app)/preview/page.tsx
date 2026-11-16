import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getWeddingByUser } from "@/lib/weddings";
import { PreviewFrame } from "@/components/PreviewFrame";

export const metadata = { title: "Preview", robots: { index: false } };

export default async function Page() {
  const user = await requireUser();
  const w = getWeddingByUser(user.id);
  if (!w) redirect("/create");
  return <div className="fixed inset-0 z-50 bg-white"><PreviewFrame doc={w.doc} /></div>;
}
