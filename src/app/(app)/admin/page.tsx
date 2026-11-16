import { requireAdmin } from "@/lib/auth";
import { adminList } from "@/lib/weddings";
import { AdminTable } from "@/components/AdminTable";
import { db, row } from "@/lib/db";
import { getT } from "@/lib/lang";

export const metadata = { title: "Admin" };

export default async function Page() {
  await requireAdmin();
  const { t } = await getT();
  const list = adminList().map((r) => {
    let title = r.slug;
    try { const d = JSON.parse(r.doc); title = `${d.info.bride.en || d.info.bride.si || "?"} & ${d.info.groom.en || d.info.groom.si || "?"}`; } catch {}
    const { doc: _doc, ...rest } = r;
    return { ...rest, title };
  });
  const users = row<{ n: number }>(db().prepare("SELECT COUNT(*) n FROM users WHERE role='user'").get())!.n;
  const pending = list.filter((l) => l.approval === "pending").length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">{t("Admin", "පරිපාලක")}</h1>
        <p className="mt-1 text-ink-700">{t(`${users} users · ${list.length} websites · ${pending} awaiting approval`, `පරිශීලකයන් ${users} · වෙබ් අඩවි ${list.length} · අනුමැතිය බලාපොරොත්තුවෙන් ${pending}`)}</p>
      </div>
      <AdminTable rows={list} />
    </div>
  );
}
