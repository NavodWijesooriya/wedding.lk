"use client";
import { useState, useTransition } from "react";
import { Check, Eye, Pause, X } from "lucide-react";
import Link from "next/link";
import { adminAction } from "@/app/actions/wedding";
import { useI18n } from "@/components/ui/i18n";
import { useToast } from "@/components/ui/toast";
import { Dialog } from "@/components/ui/dialog";

type Row = { id: string; slug: string; status: string; approval: string; approval_note: string | null; updated_at: number; email: string; name: string; title: string; rsvps: number };

export function AdminTable({ rows }: { rows: Row[] }) {
  const { t } = useI18n();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [reject, setReject] = useState<{ row: Row; action: "reject" | "suspend" } | null>(null);
  const [note, setNote] = useState("");
  const run = (id: string, action: "approve" | "reject" | "suspend", n?: string) =>
    start(async () => {
      const r = await adminAction(id, action, n);
      toast(r.ok ? "success" : "error", r.ok ? t("Done.", "සම්පූර්ණයි.") : r.error);
    });
  const chip = (a: string) => ({ pending: "bg-gold-300/30 text-gold-600", approved: "bg-sage-100 text-sage-600", rejected: "bg-red-50 text-red-700", none: "bg-ink-200 text-ink-700" } as Record<string, string>)[a];
  return (
    <>
      <div className="panel-card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink-200 bg-cream-100 text-xs uppercase tracking-wider text-ink-500">
            <tr><th className="px-4 py-3">{t("Couple", "යුවළ")}</th><th className="px-4 py-3">{t("Owner", "හිමිකරු")}</th><th className="px-4 py-3">{t("Status", "තත්ත්වය")}</th><th className="px-4 py-3">RSVPs</th><th className="px-4 py-3 text-right">{t("Actions", "ක්‍රියා")}</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-200/70">
            {rows.map((r) => (
              <tr key={r.id} data-testid={`admin-row-${r.slug}`}>
                <td className="px-4 py-3"><p className="font-bold">{r.title}</p><p className="text-xs text-ink-500">/w/{r.slug}</p></td>
                <td className="px-4 py-3"><p>{r.name}</p><p className="text-xs text-ink-500">{r.email}</p></td>
                <td className="px-4 py-3"><span className={`chip ${chip(r.approval)}`}>{r.approval === "none" ? t("Not submitted", "ඉදිරිපත් කර නැත") : r.approval}</span><p className="mt-1 text-xs text-ink-500">{r.status}</p>{r.approval_note && <p className="mt-1 max-w-48 text-xs text-red-600">{r.approval_note}</p>}</td>
                <td className="px-4 py-3 tabular-nums">{r.rsvps}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Link href={`/admin/preview/${r.id}`} className="btn-secondary !min-h-8 !px-2.5"><Eye className="size-4" />{t("Review", "සමාලෝචනය")}</Link>
                    {r.approval === "pending" && <button disabled={pending} onClick={() => run(r.id, "approve")} className="btn-primary !min-h-8 !px-2.5"><Check className="size-4" />{t("Approve", "අනුමත කරන්න")}</button>}
                    {r.approval === "pending" && <button disabled={pending} onClick={() => { setNote(""); setReject({ row: r, action: "reject" }); }} className="btn-secondary !min-h-8 !px-2.5 text-red-600"><X className="size-4" />{t("Reject", "ප්‍රතික්ෂේප")}</button>}
                    {r.status === "published" && <button disabled={pending} onClick={() => { setNote(""); setReject({ row: r, action: "suspend" }); }} className="btn-secondary !min-h-8 !px-2.5 text-red-600"><Pause className="size-4" />{t("Suspend", "අත්හිටුවන්න")}</button>}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-500">{t("No websites yet.", "තවම වෙබ් අඩවි නැත.")}</td></tr>}
          </tbody>
        </table>
      </div>
      <Dialog open={!!reject} onClose={() => setReject(null)} title={reject?.action === "suspend" ? t("Suspend website", "වෙබ් අඩවිය අත්හිටුවන්න") : t("Reject website", "වෙබ් අඩවිය ප්‍රතික්ෂේප කරන්න")}
        footer={<><button className="btn-secondary" onClick={() => setReject(null)}>{t("Cancel", "අවලංගු")}</button><button className="btn-danger" onClick={() => { if (reject) run(reject.row.id, reject.action, note); setReject(null); }}>{t("Confirm", "තහවුරු කරන්න")}</button></>}>
        <label className="label" htmlFor="note">{t("Message to the owner", "හිමිකරුට පණිවිඩය")}</label>
        <textarea id="note" className="input" rows={3} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      </Dialog>
    </>
  );
}
