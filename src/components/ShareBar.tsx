"use client";
import { useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, Globe, MessageCircle, PenLine, Share2, Eye } from "lucide-react";
import { useI18n } from "@/components/ui/i18n";
import { useToast } from "@/components/ui/toast";
import { PublishDialog } from "@/components/editor/PublishDialog";
import type { PublishState } from "@/app/actions/wedding";

export function ShareBar({ initial, origin }: { initial: PublishState; origin: string }) {
  const { t } = useI18n();
  const toast = useToast();
  const [state, setState] = useState(initial);
  const [open, setOpen] = useState(false);
  const live = state.status === "published";
  const url = `${origin}/w/${state.slug}`;
  const copy = async () => { try { await navigator.clipboard.writeText(url); toast("success", t("Link copied!", "ලින්ක් එක පිටපත් විය!")); } catch { toast("error", url); } };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: t("Our wedding invitation", "අපගේ විවාහ ආරාධනය"), url }); return; } catch { /* cancelled */ } }
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank", "noopener");
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-cream-50 py-1.5 pl-3.5 pr-1.5">
        <Globe className="size-4 shrink-0 text-ink-500" />
        <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${live ? "text-ink-900" : "text-ink-500"}`} data-testid="site-url">{url.replace(/^https?:\/\//, "")}</span>
        <button className="btn-secondary !min-h-9 !px-3" onClick={copy}><Copy className="size-4" />{t("Copy", "පිටපත්")}</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/editor" className="btn-primary btn-lg flex-1 sm:flex-none"><PenLine className="size-5" />{t("Edit website", "වෙබ් අඩවිය සංස්කරණය")}</Link>
        <button className={`btn-lg ${live ? "btn-secondary" : "btn-gold"} flex-1 sm:flex-none`} onClick={() => setOpen(true)}><Globe className="size-5" />{live ? t("Manage publishing", "ප්‍රකාශනය කළමනාකරණය") : state.status === "pending" ? t("Approval status", "අනුමැති තත්ත්වය") : t("Publish", "ප්‍රකාශ කරන්න")}</button>
        <Link href="/preview" className="btn-secondary btn-lg"><Eye className="size-5" /><span className="sr-only sm:not-sr-only">{t("Preview", "පෙරදසුන")}</span></Link>
        {live && <button className="btn-secondary btn-lg" onClick={share}><Share2 className="size-5" /><span className="sr-only sm:not-sr-only">{t("Share", "බෙදාගන්න")}</span></button>}
        {live && <a className="btn-secondary btn-lg" href={url} target="_blank" rel="noopener noreferrer" aria-label={t("Open live site", "සජීවී අඩවිය විවෘත කරන්න")}><ExternalLink className="size-5" /></a>}
      </div>
      <PublishDialog open={open} onClose={() => setOpen(false)} state={state} setState={setState} flush={async () => {}} origin={origin} />
    </div>
  );
}
