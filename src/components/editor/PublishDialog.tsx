"use client";
import { useEffect, useState } from "react";
import { Check, Clock, Copy, ExternalLink, Globe, Loader2, MessageCircle, XCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useI18n } from "@/components/ui/i18n";
import { useToast } from "@/components/ui/toast";
import { checkSlugAction, publishAction, setSlugAction, unpublishAction, type PublishState } from "@/app/actions/wedding";

export function PublishDialog({ open, onClose, state, setState, flush, origin }: {
  open: boolean; onClose: () => void; state: PublishState; setState: (s: PublishState) => void; flush: () => Promise<void>; origin: string;
}) {
  const { t } = useI18n();
  const toast = useToast();
  const [slug, setSlug] = useState(state.slug);
  const [slugErr, setSlugErr] = useState("");
  const [busy, setBusy] = useState<"" | "publish" | "unpublish" | "slug">("");
  const live = state.status === "published";
  const pending = state.status === "pending";
  const url = `${origin}/w/${state.slug}`;

  useEffect(() => { if (open) { setSlug(state.slug); setSlugErr(""); } }, [open, state.slug]);
  useEffect(() => {
    if (!open || slug === state.slug) { setSlugErr(""); return; }
    const h = setTimeout(async () => { const r = await checkSlugAction(slug); setSlugErr(r.ok ? "" : r.error || ""); }, 350);
    return () => clearTimeout(h);
  }, [slug, open, state.slug]);

  const saveSlug = async () => {
    setBusy("slug");
    const r = await setSlugAction(slug);
    setBusy("");
    if (!r.ok) return setSlugErr(r.error);
    setState({ ...state, slug });
    toast("success", t("Website address updated.", "වෙබ් අඩවි ලිපිනය යාවත්කාලීන විය."));
  };
  const publish = async () => {
    if (slug !== state.slug && !slugErr) await saveSlug();
    setBusy("publish");
    await flush();
    const r = await publishAction();
    setBusy("");
    if (!r.ok) return toast("error", r.error === "missing_names" ? t("Please add the bride's and groom's names before publishing.", "ප්‍රකාශ කිරීමට පෙර මනාලිය සහ මනාලයාගේ නම් එක් කරන්න.") : r.error);
    setState(r.state);
    toast("success", r.state.status === "published" ? t("Your website is live!", "ඔබේ වෙබ් අඩවිය සජීවීයි!") : t("Submitted for approval.", "අනුමැතිය සඳහා යවන ලදී."));
  };
  const unpublish = async () => {
    setBusy("unpublish");
    const r = await unpublishAction();
    setBusy("");
    if (!r.ok) return toast("error", r.error);
    setState(r.state);
    toast("success", t("Website unpublished. Guests can no longer open the link.", "වෙබ් අඩවිය ප්‍රකාශයෙන් ඉවත් කළා."));
  };
  const copy = async () => { try { await navigator.clipboard.writeText(url); toast("success", t("Link copied!", "ලින්ක් එක පිටපත් විය!")); } catch { toast("error", url); } };

  return (
    <Dialog open={open} onClose={onClose} title={live ? t("Your website is live", "ඔබේ වෙබ් අඩවිය සජීවීයි") : t("Publish your website", "ඔබේ වෙබ් අඩවිය ප්‍රකාශ කරන්න")}>
      <div className="space-y-5">
        <div className={`flex items-start gap-3 rounded-2xl p-4 ${live ? "bg-sage-100 text-sage-600" : pending ? "bg-gold-300/25 text-gold-600" : state.approval === "rejected" ? "bg-red-50 text-red-700" : "bg-cream-100 text-ink-700"}`} role="status">
          {live ? <Globe className="mt-0.5 size-5 shrink-0" /> : pending ? <Clock className="mt-0.5 size-5 shrink-0" /> : state.approval === "rejected" ? <XCircle className="mt-0.5 size-5 shrink-0" /> : <Globe className="mt-0.5 size-5 shrink-0" />}
          <p className="text-sm font-medium">
            {live ? t("Guests can open your invitation at the link below. Publish again any time to share new changes.", "අමුත්තන්ට පහත ලින්ක් එකෙන් ඔබේ ආරාධනය විවෘත කළ හැක. නව වෙනස්කම් බෙදා ගැනීමට ඕනෑම වේලාවක නැවත ප්‍රකාශ කරන්න.")
              : pending ? t("Waiting for approval. We review every invitation before it goes live — usually within a day. The link will start working once approved.", "අනුමැතිය බලාපොරොත්තුවෙන්. සජීවී වීමට පෙර සෑම ආරාධනයක්ම අපි සමාලෝචනය කරමු. අනුමත වූ පසු ලින්ක් එක ක්‍රියා කරයි.")
              : state.approval === "rejected" ? `${t("Not approved:", "අනුමත නොවීය:")} ${state.note || t("please review your content and publish again.", "අන්තර්ගතය පරීක්ෂා කර නැවත ප්‍රකාශ කරන්න.")}`
              : t("Your website is a private draft. Publish it to get a link you can share.", "ඔබේ වෙබ් අඩවිය පුද්ගලික කෙටුම්පතකි. බෙදා ගත හැකි ලින්ක් එකක් ලබා ගැනීමට ප්‍රකාශ කරන්න.")}
          </p>
        </div>

        <div>
          <label className="label" htmlFor="slug">{t("Website address", "වෙබ් අඩවි ලිපිනය")}</label>
          <div className="flex items-center overflow-hidden rounded-xl border border-ink-200 bg-white focus-within:border-maroon-500 focus-within:ring-2 focus-within:ring-maroon-500/20">
            <span className="select-none whitespace-nowrap bg-cream-100 px-3 py-2.5 text-sm text-ink-500">{origin.replace(/^https?:\/\//, "")}/w/</span>
            <input id="slug" className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[15px] outline-none" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} maxLength={40} aria-invalid={!!slugErr} />
          </div>
          {slugErr ? <p className="err">{slugErr}</p> : slug !== state.slug ? <p className="hint text-sage-600">{t("Available", "ලබා ගත හැක")} ✓</p> : <p className="hint">{t("Letters, numbers and hyphens. Share this link with your guests.", "අකුරු, ඉලක්කම් සහ ඉරි. මෙම ලින්ක් එක අමුත්තන්ට බෙදා හරින්න.")}</p>}
        </div>

        {(live || pending) && (
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={copy}><Copy className="size-4" /> {t("Copy link", "ලින්ක් පිටපත් කරන්න")}</button>
            {live && <a className="btn-secondary" href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /> {t("Open", "විවෘත කරන්න")}</a>}
            {live && <a className="btn-secondary" href={`https://wa.me/?text=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" /> WhatsApp</a>}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-ink-200/70 pt-4">
          {(live || pending) && <button className="btn-secondary text-red-600" disabled={!!busy} onClick={unpublish}>{busy === "unpublish" && <Loader2 className="size-4 animate-spin" />}{pending ? t("Withdraw request", "ඉල්ලීම ඉවත් කරන්න") : t("Unpublish", "ප්‍රකාශයෙන් ඉවත් කරන්න")}</button>}
          <button className="btn-primary" disabled={!!busy || (!!slugErr)} onClick={publish}>
            {busy === "publish" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {live ? t("Publish updates", "යාවත්කාලීන ප්‍රකාශ කරන්න") : pending ? t("Resubmit", "නැවත යවන්න") : t("Publish website", "වෙබ් අඩවිය ප්‍රකාශ කරන්න")}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
