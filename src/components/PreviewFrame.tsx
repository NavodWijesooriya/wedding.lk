"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone, Tablet } from "lucide-react";
import type { Doc, Wish } from "@/lib/site/types";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { useI18n } from "@/components/ui/i18n";

export function PreviewFrame({ doc, wishes = [], note, back = "/editor" }: { doc: Doc; wishes?: Wish[]; note?: string; back?: string }) {
  const { t } = useI18n();
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const w = { desktop: "100%", tablet: "820px", mobile: "390px" }[device];
  return (
    <div className="flex h-dvh flex-col bg-ink-200/60">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-200 bg-white px-3">
        <Link href={back} className="btn-ghost"><ArrowLeft className="size-4" /> <span className="hidden sm:inline">{t("Back", "ආපසු")}</span></Link>
        <p className="hidden truncate text-sm font-semibold text-ink-700 md:block">{note ?? t("Preview — this is how guests will see your invitation", "පෙරදසුන — අමුත්තන්ට ඔබේ ආරාධනය පෙනෙන ආකාරය")}</p>
        <div className="ml-auto inline-flex rounded-xl border border-ink-200 bg-cream-50 p-0.5" role="group" aria-label="Device">
          {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, I]) => (
            <button key={d} aria-pressed={device === d} aria-label={d} onClick={() => setDevice(d)} className={`flex size-8 items-center justify-center rounded-[10px] ${device === d ? "bg-white text-maroon-700 shadow-sm" : "text-ink-500"}`}><I className="size-4" /></button>
          ))}
        </div>
      </header>
      <main id="main" className="min-h-0 flex-1 overflow-y-auto p-0 md:p-5">
        <div className="mx-auto min-h-full overflow-hidden bg-white shadow-lift transition-[max-width] duration-300 md:rounded-xl" style={{ maxWidth: w }}>
          <SiteRenderer doc={doc} wishes={wishes} animate showLangSwitch />
        </div>
      </main>
    </div>
  );
}
