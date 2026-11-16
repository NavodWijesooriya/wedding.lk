"use client";
import { useState, useTransition } from "react";
import { Download, Eye, EyeOff, MessageCircleHeart, Trash2, Users } from "lucide-react";
import { useI18n } from "@/components/ui/i18n";
import { Confirm } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { deleteRsvpAction, wishVisibilityAction } from "@/app/actions/wedding";

type Row = { id: string; name: string; attending: "yes" | "no" | "maybe"; guests: number; phone: string | null; message: string | null; show_wish: number; created_at: number };

export function GuestsTable({ rows: initial, stats }: { rows: Row[]; stats: { total: number; yes: number; no: number; maybe: number; guests: number } }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<"all" | "yes" | "maybe" | "no">("all");
  const [del, setDel] = useState<Row | null>(null);
  const [, start] = useTransition();
  const shown = rows.filter((r) => filter === "all" || r.attending === filter);
  const label = { yes: t("Attending", "පැමිණෙන"), maybe: t("Maybe", "තහවුරු නැත"), no: t("Declined", "නොහැක") };
  const fmt = (ms: number) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Colombo" }).format(ms);

  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = ["Name,Response,Guests,Phone,Message,Date", ...rows.map((r) => [r.name, r.attending, r.guests, r.phone, r.message, new Date(r.created_at).toISOString()].map(esc).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "rsvp-responses.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[[stats.total, t("Replies", "පිළිතුරු"), "bg-white"], [stats.yes, t("Attending", "පැමිණෙන"), "bg-sage-100 text-sage-600"], [stats.guests, t("Confirmed guests", "තහවුරු අමුත්තන්"), "bg-maroon-100 text-maroon-700"], [stats.no + stats.maybe, t("Declined / maybe", "නොහැක / තහවුරු නැත"), "bg-ink-200/70"]].map(([n, l, c]) => (
          <div key={l as string} className={`panel-card px-5 py-4 ${c}`}><div className="font-display text-4xl font-bold">{n}</div><div className="text-xs font-bold">{l}</div></div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-ink-200 bg-white p-0.5" role="group" aria-label="Filter">
          {(["all", "yes", "maybe", "no"] as const).map((f) => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)} className={`rounded-[10px] px-3.5 py-1.5 text-sm font-semibold ${filter === f ? "bg-maroon-600 text-white" : "text-ink-700"}`}>{f === "all" ? t("All", "සියල්ල") : label[f]}</button>)}
        </div>
        <button className="btn-secondary" onClick={exportCsv} disabled={!rows.length}><Download className="size-4" />{t("Export CSV", "CSV අපනයනය")}</button>
      </div>

      {shown.length === 0 ? (
        <div className="panel-card flex flex-col items-center gap-2 px-6 py-16 text-center">
          <Users className="size-10 text-ink-300" />
          <p className="font-display text-3xl font-bold">{rows.length ? t("No replies match this filter", "මෙම පෙරහනට ගැළපෙන පිළිතුරු නැත") : t("No replies yet", "තවම පිළිතුරු නැත")}</p>
          <p className="max-w-sm text-ink-500">{rows.length ? "" : t("Once guests open your link and reply, they'll show up here.", "අමුත්තන් ඔබේ ලින්ක් එක විවෘත කර පිළිතුරු දුන් පසු ඔවුන් මෙහි පෙනේ.")}</p>
        </div>
      ) : (
        <ul className="panel-card divide-y divide-ink-200/70 overflow-hidden" aria-label="Responses">
          {shown.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start gap-x-4 gap-y-2 px-5 py-4">
              <div className="min-w-0 flex-1 basis-56">
                <p className="font-bold">{r.name}</p>
                <p className="text-xs text-ink-500">{fmt(r.created_at)}{r.phone ? ` · ${r.phone}` : ""}</p>
                {r.message && <p className="mt-2 flex gap-2 text-sm text-ink-700"><MessageCircleHeart className="mt-0.5 size-4 shrink-0 text-lotus-500" /><span className={r.show_wish ? "" : "line-through opacity-50"}>{r.message}</span></p>}
              </div>
              <span className={`chip ${r.attending === "yes" ? "bg-sage-100 text-sage-600" : r.attending === "maybe" ? "bg-gold-300/25 text-gold-600" : "bg-ink-200 text-ink-700"}`}>{label[r.attending]}{r.attending === "yes" ? ` · ${r.guests}` : ""}</span>
              <div className="flex">
                {r.message && (
                  <button className="btn-icon" aria-label={r.show_wish ? t("Hide wish from website", "සුබ පැතුම වෙබ් අඩවියෙන් සඟවන්න") : t("Show wish on website", "සුබ පැතුම වෙබ් අඩවියේ පෙන්වන්න")} title={r.show_wish ? t("Visible on website", "වෙබ් අඩවියේ පෙනේ") : t("Hidden", "සැඟවී ඇත")} onClick={() => { const show = !r.show_wish; setRows(rows.map((x) => x.id === r.id ? { ...x, show_wish: show ? 1 : 0 } : x)); start(() => wishVisibilityAction(r.id, show)); }}>
                    {r.show_wish ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                )}
                <button className="btn-icon text-red-600" aria-label={`${t("Delete reply from", "පිළිතුර මකන්න")} ${r.name}`} onClick={() => setDel(r)}><Trash2 className="size-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Confirm open={!!del} onClose={() => setDel(null)} title={t("Delete this reply?", "මෙම පිළිතුර මකන්නද?")} text={del ? t(`${del.name}'s response will be permanently removed.`, `${del.name}ගේ පිළිතුර ස්ථිරවම ඉවත් වේ.`) : ""} confirmLabel={t("Delete", "මකන්න")} onConfirm={() => { if (!del) return; setRows(rows.filter((x) => x.id !== del.id)); start(async () => { await deleteRsvpAction(del.id); toast("success", t("Reply deleted.", "පිළිතුර මකා දමන ලදී.")); }); }} />
    </div>
  );
}
