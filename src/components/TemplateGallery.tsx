"use client";
import { useState } from "react";
import { Check, Eye, Monitor, Smartphone } from "lucide-react";
import { TEMPLATES, type TemplateDef } from "@/lib/site/templates";
import { applyTemplate, demoDoc } from "@/lib/site/defaults";
import type { Doc } from "@/lib/site/types";
import { ScaledSite } from "@/components/site/ScaledSite";
import { Dialog } from "@/components/ui/dialog";
import { useI18n } from "@/components/ui/i18n";

/** `base` is the user's own content (so previews show their names) — if absent, demo content is used. */
export function TemplateGallery({ selected, onSelect, base, selectLabel, hrefTemplate }: {
  selected?: string; onSelect?: (id: string) => void; base?: Doc | null; selectLabel?: string; hrefTemplate?: string;
}) {
  const { t, lang } = useI18n();
  const [preview, setPreview] = useState<TemplateDef | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const hrefFor = hrefTemplate ? (id: string) => hrefTemplate.replace("{id}", id) : undefined;
  const docFor = (id: string) => (base ? applyTemplate(base, id) : demoDoc(id, lang));
  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((tp) => {
          const on = selected === tp.id;
          return (
            <li key={tp.id} className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white transition ${on ? "border-maroon-600 ring-2 ring-maroon-600/25 shadow-lift" : "border-ink-200/80 shadow-soft hover:-translate-y-0.5 hover:shadow-lift"}`}>
              <button type="button" className="relative block text-left" onClick={() => setPreview(tp)} aria-label={`${t("Live preview", "සජීවී පෙරදසුන")}: ${tp.name[lang]}`}>
                <div className="bg-cream-100 p-3 pb-0">
                  <div className="overflow-hidden rounded-t-xl border border-b-0 border-ink-200 bg-white shadow-soft">
                    <ScaledSite doc={docFor(tp.id)} maxSections={2} ratio={0.82} width={1100} />
                  </div>
                </div>
                <div className="absolute bottom-0 right-5 w-[22%] overflow-hidden rounded-t-2xl border-[3px] border-b-0 border-ink-900 bg-ink-900 shadow-lift">
                  <ScaledSite doc={docFor(tp.id)} maxSections={1} width={390} ratio={1.9} />
                </div>
                <span className="absolute inset-0 flex items-center justify-center bg-ink-900/0 opacity-0 transition group-hover:bg-ink-900/25 group-hover:opacity-100">
                  <span className="btn-secondary pointer-events-none"><Eye className="size-4" /> {t("Live preview", "සජීවී පෙරදසුන")}</span>
                </span>
              </button>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-2xl font-bold">{tp.name[lang]}</h3>
                    <span className="flex gap-1" aria-hidden="true">{[tp.theme.primary, tp.theme.secondary, tp.theme.bg].map((c) => <i key={c} className="size-4 rounded-full border border-black/10" style={{ background: c }} />)}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">{tp.desc[lang]}</p>
                </div>
                <div className="mt-auto flex gap-2">
                  <button type="button" className="btn-secondary flex-1" onClick={() => setPreview(tp)}><Eye className="size-4" /> {t("Preview", "පෙරදසුන")}</button>
                  {hrefFor ? (
                    <a href={hrefFor(tp.id)} className="btn-primary flex-1">{selectLabel ?? t("Use this design", "මෙම සැලසුම")}</a>
                  ) : (
                    <button type="button" className={`flex-1 ${on ? "btn-gold" : "btn-primary"}`} onClick={() => onSelect?.(tp.id)} aria-pressed={on}>
                      {on ? <><Check className="size-4" /> {t("Selected", "තෝරා ඇත")}</> : (selectLabel ?? t("Select & customize", "තෝරා සකස් කරන්න"))}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog open={!!preview} onClose={() => setPreview(null)} wide title={preview ? preview.name[lang] : ""} footer={preview && (
        hrefFor ? <a href={hrefFor(preview.id)} className="btn-primary">{selectLabel ?? t("Use this design", "මෙම සැලසුම")}</a>
          : <button className="btn-primary" onClick={() => { onSelect?.(preview.id); setPreview(null); }}>{selectLabel ?? t("Select & customize", "තෝරා සකස් කරන්න")}</button>
      )}>
        {preview && (
          <div>
            <div className="mb-4 flex justify-center">
              <div className="inline-flex rounded-full border border-ink-200 bg-cream-50 p-0.5" role="group" aria-label="Device">
                {([["desktop", Monitor, t("Desktop", "ඩෙස්ක්ටොප්")], ["mobile", Smartphone, t("Mobile", "ජංගම")]] as const).map(([d, Icon, l]) => (
                  <button key={d} type="button" aria-pressed={device === d} onClick={() => setDevice(d)} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold ${device === d ? "bg-maroon-600 text-white" : "text-ink-700"}`}><Icon className="size-4" />{l}</button>
                ))}
              </div>
            </div>
            <div className="mx-auto h-[60vh] overflow-hidden rounded-2xl border border-ink-200 bg-ink-200/40 p-0" style={{ maxWidth: device === "mobile" ? 390 : "100%" }}>
              <ScaledSite key={preview.id + device} doc={docFor(preview.id)} width={device === "mobile" ? 390 : 1200} scroll />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
