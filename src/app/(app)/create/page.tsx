import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getWeddingByUser } from "@/lib/weddings";
import { CreateWizard } from "@/components/CreateWizard";
import { TEMPLATES } from "@/lib/site/templates";

export const metadata = { title: "Create your wedding website" };

export default async function Page({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const user = await requireUser();
  if (getWeddingByUser(user.id)) redirect("/dashboard");
  const sp = await searchParams;
  const tpl = TEMPLATES.find((t) => t.id === sp.template)?.id ?? "kandyan";
  return <CreateWizard initialTemplate={tpl} />;
}
