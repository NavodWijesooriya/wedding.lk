import Link from "next/link";
import { headers } from "next/headers";
import { CalendarHeart, CheckCircle2, Clock3, HelpCircle, Images, Palette, Sparkles, UserRound, Wand2, XCircle, ArrowRight, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getWeddingByUser, listRsvps, recentActivity, rsvpStats } from "@/lib/weddings";
import { getT } from "@/lib/lang";
import { ScaledSite } from "@/components/site/ScaledSite";
import { ShareBar } from "@/components/ShareBar";
import { Lotus } from "@/components/site/ornaments";
import { formatDate, timeAgo, tr } from "@/lib/site/util";
import { PALETTES } from "@/lib/site/templates";

export const metadata = { title: "Dashboard" };

export default async function Page() {
  const user = await requireUser();
  const { t, lang } = await getT();
  const w = getWeddingByUser(user.id);

  if (!w) {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-ink-200/70 bg-white px-8 py-16 text-center shadow-soft">
        <Lotus className="mx-auto h-16 w-24 text-gold-500" />
        <h1 className="mt-4 font-display text-5xl font-bold">{t(`Welcome, ${user.name.split(" ")[0]}`, `ආයුබෝවන්, ${user.name.split(" ")[0]}`)}</h1>
        <p className="mx-auto mt-3 max-w-md text-lg text-ink-700">{t("Let's create your wedding invitation website. It takes about five minutes.", "ඔබේ විවාහ ආරාධන වෙබ් අඩවිය සාදමු. විනාඩි පහක් පමණ ගත වේ.")}</p>
        <Link href="/create" className="btn-primary btn-lg mt-8"><Sparkles className="size-5" /> {t("Create my website", "මගේ වෙබ් අඩවිය සාදන්න")}</Link>
      </div>
    );
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
  const stats = rsvpStats(w.id);
  const recent = listRsvps(w.id, 5);
  const activity = recentActivity(w.id, 6);
  const d = w.doc;
  const names = `${tr(d.info.bride, lang) || t("Bride", "මනාලිය")} & ${tr(d.info.groom, lang) || t("Groom", "මනාලයා")}`;
  const days = d.info.date ? Math.ceil((new Date(`${d.info.date}T00:00:00+05:30`).getTime() - Date.now()) / 864e5) : null;
  const badge = {
    published: { cls: "bg-sage-100 text-sage-600", icon: CheckCircle2, label: t("Live", "සජීවී") },
    pending: { cls: "bg-gold-300/30 text-gold-600", icon: Clock3, label: t("Awaiting approval", "අනුමැතිය බලාපොරොත්තුවෙන්") },
    unpublished: { cls: "bg-ink-200 text-ink-700", icon: XCircle, label: t("Unpublished", "ප්‍රකාශයෙන් ඉවත්") },
    draft: { cls: "bg-ink-200 text-ink-700", icon: Clock3, label: w.approval === "rejected" ? t("Needs changes", "වෙනස්කම් අවශ්‍යයි") : t("Draft", "කෙටුම්පත") },
  }[w.status];
  const BIcon = badge.icon;
  const sw = [
    [t("Template", "සැලසුම"), Wand2, "/editor?panel=templates"], [t("Colours & fonts", "වර්ණ සහ අකුරු"), Palette, "/editor?panel=theme"],
    [t("Details", "විස්තර"), UserRound, "/editor?panel=info"], [t("Photos", "ඡායාරූප"), Images, "/editor"],
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink-500">{t("Your wedding website", "ඔබේ විවාහ වෙබ් අඩවිය")}</p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">{names}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-700">
            {d.info.date && <span className="inline-flex items-center gap-1.5"><CalendarHeart className="size-4 text-maroon-600" />{formatDate(d.info.date, lang)}</span>}
            {days !== null && days >= 0 && <span className="chip bg-maroon-100 text-maroon-700">{days === 0 ? t("Today!", "අද!") : t(`${days} days to go`, `තව දින ${days}යි`)}</span>}
          </p>
        </div>
        <span className={`chip ${badge.cls} !text-sm`} data-testid="status-badge"><BIcon className="size-4" />{badge.label}</span>
      </div>

      {w.status === "draft" && w.approval === "rejected" && w.approvalNote && (
        <p role="alert" className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{t("Your website wasn't approved:", "ඔබේ වෙබ් අඩවිය අනුමත නොවිය:")} {w.approvalNote}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <section className="panel-card overflow-hidden" aria-label={t("Website preview", "වෙබ් අඩවි පෙරදසුන")}>
          <Link href="/editor" className="group relative block bg-cream-100 p-4 pb-0">
            <div className="overflow-hidden rounded-t-xl border border-b-0 border-ink-200 bg-white shadow-soft">
              <ScaledSite doc={d} lang={d.lang} maxSections={2} ratio={0.58} />
            </div>
            <span className="absolute inset-0 flex items-center justify-center bg-ink-900/0 opacity-0 transition group-hover:bg-ink-900/20 group-hover:opacity-100"><span className="btn-secondary pointer-events-none">{t("Open editor", "සංස්කාරකය විවෘත කරන්න")}</span></span>
          </Link>
          <div className="p-5 sm:p-6"><ShareBar initial={{ status: w.status, approval: w.approval, slug: w.slug, note: w.approvalNote }} origin={origin} /></div>
        </section>

        <section className="panel-card p-5 sm:p-6" aria-label="RSVP summary">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl font-bold">{t("Guest responses", "අමුත්තන්ගේ පිළිතුරු")}</h2>
            <Link href="/dashboard/guests" className="inline-flex items-center gap-1 text-sm font-bold text-maroon-600 hover:underline">{t("View all", "සියල්ල")} <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[[stats.yes, t("Attending", "පැමිණෙන"), "text-sage-600 bg-sage-100"], [stats.maybe, t("Maybe", "තහවුරු නැත"), "text-gold-600 bg-gold-300/25"], [stats.no, t("Declined", "නොහැක"), "text-ink-700 bg-ink-200/70"]].map(([n, l, c]) => (
              <div key={l as string} className={`rounded-2xl px-2 py-4 ${c}`}><div className="font-display text-4xl font-bold leading-none" data-testid={`stat-${l}`}>{n}</div><div className="mt-1 text-xs font-bold">{l}</div></div>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-ink-700"><Users className="size-4 text-maroon-600" /> {t(`${stats.guests} guests confirmed from ${stats.total} replies`, `පිළිතුරු ${stats.total}කින් අමුත්තන් ${stats.guests}ක් තහවුරුයි`)}</p>
          <ul className="mt-5 divide-y divide-ink-200/70">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0"><span className="block truncate font-semibold">{r.name}</span><span className="text-xs text-ink-500">{timeAgo(r.created_at, lang)}</span></span>
                <span className={`chip ${r.attending === "yes" ? "bg-sage-100 text-sage-600" : r.attending === "maybe" ? "bg-gold-300/25 text-gold-600" : "bg-ink-200 text-ink-700"}`}>{r.attending === "yes" ? `${t("Attending", "පැමිණෙන")} · ${r.guests}` : r.attending === "maybe" ? t("Maybe", "තහවුරු නැත") : t("Declined", "නොහැක")}</span>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="flex flex-col items-center gap-2 py-8 text-center text-ink-500"><HelpCircle className="size-8 text-ink-300" /><span className="text-sm">{w.status === "published" ? t("No replies yet. Share your link to start collecting RSVPs.", "තවම පිළිතුරු නැත. RSVP ලබා ගැනීමට ඔබේ ලින්ක් එක බෙදා හරින්න.") : t("Replies will appear here once your website is published and shared.", "ඔබේ වෙබ් අඩවිය ප්‍රකාශ කර බෙදා හැරි පසු පිළිතුරු මෙහි පෙනේ.")}</span></li>
            )}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <section className="panel-card p-5 sm:p-6">
          <h2 className="font-display text-3xl font-bold">{t("Quick customisation", "ඉක්මන් අභිරුචිකරණය")}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {sw.map(([l, I, href]) => (
              <li key={l}><Link href={href} className="flex h-full flex-col items-center gap-2 rounded-2xl border border-ink-200 bg-cream-50 px-3 py-5 text-center text-sm font-bold transition hover:-translate-y-0.5 hover:border-maroon-500 hover:shadow-soft"><I className="size-6 text-maroon-600" />{l}</Link></li>
            ))}
          </ul>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-ink-500">{t("Colour palettes", "වර්ණ සංයුති")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PALETTES.map((p) => <Link key={p.id} href="/editor?panel=theme" title={p.name[lang]} aria-label={p.name[lang]} className="flex h-8 w-16 overflow-hidden rounded-lg border border-black/10 transition hover:scale-105">{[p.bg, p.primary, p.secondary].map((c) => <i key={c} className="flex-1" style={{ background: c }} />)}</Link>)}
          </div>
        </section>
        <section className="panel-card p-5 sm:p-6">
          <h2 className="font-display text-3xl font-bold">{t("Recent updates", "මෑත යාවත්කාලීන")}</h2>
          <ul className="mt-3 space-y-3">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3 text-sm"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold-500" /><span><span className="font-medium">{a.text}</span><span className="block text-xs text-ink-500">{timeAgo(a.created_at, lang)}</span></span></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
