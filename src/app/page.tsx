import Link from "next/link";
import { ArrowRight, MousePointerClick, Palette, Languages, Share2, MailCheck, Smartphone } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { LangSwitch } from "@/components/ui/i18n";
import { ScaledSite } from "@/components/site/ScaledSite";
import { Divider, Lotus } from "@/components/site/ornaments";
import { demoDoc } from "@/lib/site/defaults";
import { TEMPLATES } from "@/lib/site/templates";
import { getUser } from "@/lib/auth";
import { getT } from "@/lib/lang";

export default async function Home() {
  const [user, { t, lang }] = await Promise.all([getUser(), getT()]);
  const hero = demoDoc("lotus", lang);
  const phone = demoDoc("kandyan", lang);
  const steps = [
    [t("Tell us about your day", "ඔබේ දවස ගැන කියන්න"), t("Names, date, venue and your message — in Sinhala, English or both.", "නම්, දිනය, ස්ථානය සහ පණිවිඩය — සිංහල, ඉංග්‍රීසි හෝ දෙකම.")],
    [t("Choose a design", "සැලසුමක් තෝරන්න"), t("Ten Sri Lankan-inspired templates. Switch any time — nothing is lost.", "ශ්‍රී ලාංකික ආභාෂයෙන් සැලසුම් දහයක්. ඕනෑම වේලාවක මාරු කළ හැක — කිසිවක් නොවැටේ.")],
    [t("Click, edit, publish", "ක්ලික් කරන්න, සංස්කරණය, ප්‍රකාශ කරන්න"), t("Edit right on the page, then share one link on WhatsApp.", "පිටුවේම සංස්කරණය කර, WhatsApp හරහා ලින්ක් එක බෙදා හරින්න.")],
  ];
  const features = [
    [MousePointerClick, t("Click-to-edit builder", "ක්ලික් කර සංස්කරණය"), t("Tap any name, date or photo and change it on the spot.", "ඕනෑම නමක්, දිනයක් හෝ ඡායාරූපයක් ස්පර්ශ කර වහාම වෙනස් කරන්න.")],
    [Palette, t("Colours & fonts, your way", "වර්ණ සහ අකුරු ඔබේ කැමැත්තට"), t("Sri Lankan palettes or your own — with Sinhala-ready typography.", "ශ්‍රී ලාංකික වර්ණ හෝ ඔබේම — සිංහල සඳහා සුදුසු අකුරු සමඟ.")],
    [Languages, t("Sinhala & English", "සිංහල සහ ඉංග්‍රීසි"), t("Guests can switch language on your invitation with one tap.", "අමුත්තන්ට ආරාධනයේදීම භාෂාව එක් ස්පර්ශයකින් මාරු කළ හැක.")],
    [MailCheck, t("RSVP & guest wishes", "පැමිණීම සහ සුබ පැතුම්"), t("See who is coming, how many, and read their blessings.", "කවුරුන් එනවාද, කී දෙනාද කියා බලා ආශීර්වාද කියවන්න.")],
    [Smartphone, t("Made for phones", "දුරකථන සඳහා සාදන ලදී"), t("Looks perfect on every screen your guests use.", "ඔබේ අමුත්තන් භාවිතා කරන සෑම තිරයකම පරිපූර්ණව පෙනේ.")],
    [Share2, t("One link to share", "බෙදා ගැනීමට එක ලින්ක් එකයි"), t("wedding.lk/w/your-names — ready for WhatsApp and Facebook.", "wedding.lk/w/ඔබේ-නම් — WhatsApp සහ Facebook සඳහා සූදානම්.")],
  ] as const;

  return (
    <div className="bg-cream-50">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Brand />
        <nav className="flex items-center gap-2 sm:gap-3">
          <LangSwitch className="hidden sm:inline-flex" />
          {user ? (
            <Link href="/dashboard" className="btn-primary">{t("Open dashboard", "උපකරණ පුවරුව")}</Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">{t("Sign in", "පිවිසෙන්න")}</Link>
              <Link href="/signup" className="btn-primary">{t("Get started", "ආරම්භ කරන්න")}</Link>
            </>
          )}
        </nav>
      </header>

      <main id="main">
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-8 lg:grid-cols-[1fr_1.1fr] lg:pt-16">
          <div className="min-w-0">
            <p className="chip bg-gold-300/30 text-gold-600"><Lotus className="h-3.5 w-5" /> {t("Sri Lankan wedding websites", "ශ්‍රී ලාංකික විවාහ වෙබ් අඩවි")}</p>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.02] text-ink-900 sm:text-6xl lg:text-7xl">
              {t("Your wedding invitation, ", "ඔබේ මංගල ආරාධනය, ")}
              <span className="italic text-maroon-600">{t("designed by you.", "ඔබම නිර්මාණය කළ.")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-700">{t("Build a beautiful Sinhala & English invitation website in minutes. Click any text or photo to edit — no coding, no designer, no stress.", "මිනිත්තු කිහිපයකින් අලංකාර සිංහල සහ ඉංග්‍රීසි ආරාධන වෙබ් අඩවියක් සාදන්න. ඕනෑම අකුරක් හෝ ඡායාරූපයක් ක්ලික් කර සංස්කරණය කරන්න — කේත ලිවීමක්, නිර්මාණකරුවෙකු හෝ ආතතියක් නැත.")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={user ? "/dashboard" : "/signup"} className="btn-primary btn-lg">{t("Create your website", "ඔබේ වෙබ් අඩවිය සාදන්න")} <ArrowRight className="size-5" /></Link>
              <Link href="/templates" className="btn-secondary btn-lg">{t("Browse templates", "සැලසුම් බලන්න")}</Link>
            </div>
            <p className="mt-4 text-sm text-ink-500">{t("Free to start · No credit card", "නොමිලේ ආරම්භය · ණය කාඩ්පතක් අවශ්‍ය නැත")}</p>
          </div>
          <div className="relative min-w-0">
            <div className="absolute -inset-6 -z-0 rounded-[3rem] bg-gradient-to-br from-gold-300/30 via-lotus-100 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift">
              <div className="flex items-center gap-1.5 border-b border-ink-200 bg-cream-100 px-4 py-2.5"><span className="size-2.5 rounded-full bg-ink-300" /><span className="size-2.5 rounded-full bg-ink-300" /><span className="size-2.5 rounded-full bg-ink-300" /><span className="ml-3 truncate rounded-md bg-white px-3 py-0.5 text-xs text-ink-500">wedding.lk/w/sanduni-and-kavindu</span></div>
              <ScaledSite doc={hero} maxSections={2} ratio={0.66} />
            </div>
            <div className="absolute -bottom-8 -left-2 w-32 overflow-hidden rounded-[1.6rem] border-[5px] border-ink-900 bg-ink-900 shadow-lift sm:-left-8 sm:w-40">
              <ScaledSite doc={phone} width={390} ratio={2.05} maxSections={1} />
            </div>
          </div>
        </section>

        <section className="border-y border-ink-200/70 bg-white py-20">
          <div className="mx-auto max-w-6xl px-5">
            <Divider ornament="lotus" className="mb-6 text-ink-500" />
            <h2 className="text-center font-display text-4xl font-bold sm:text-5xl">{t("Three simple steps", "සරල පියවර තුනක්")}</h2>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map(([h, p], i) => (
                <li key={i} className="rounded-3xl border border-ink-200/70 bg-cream-50 p-7">
                  <span className="font-display text-6xl font-bold text-gold-400">{i + 1}</span>
                  <h3 className="mt-2 text-xl font-bold">{h}</h3>
                  <p className="mt-2 text-ink-700">{p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl font-bold sm:text-5xl">{t("Ten templates, endless looks", "සැලසුම් දහයක්, අසීමිත පෙනුම්")}</h2>
            <Link href="/templates" className="btn-secondary">{t("See all templates", "සියලු සැලසුම්")} <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.slice(0, 4).map((tp) => (
              <Link key={tp.id} href="/templates" className="group block">
                <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft transition group-hover:-translate-y-1 group-hover:shadow-lift">
                  <ScaledSite doc={demoDoc(tp.id, lang)} maxSections={1} ratio={1.15} width={900} />
                </div>
                <p className="mt-3 font-bold">{tp.name[lang]}</p>
                <p className="text-sm text-ink-500">{tp.desc[lang]}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-maroon-700 py-20 text-white">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="max-w-2xl font-display text-4xl font-bold sm:text-5xl">{t("Everything you need, nothing you don't.", "ඔබට අවශ්‍ය සියල්ල, අනවශ්‍ය කිසිවක් නැත.")}</h2>
            <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(([Icon, h, p]) => (
                <div key={h}>
                  <Icon className="size-7 text-gold-300" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-bold">{h}</h3>
                  <p className="mt-1 text-white/70">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-24 text-center">
          <Lotus className="mx-auto h-14 w-20 text-gold-500" />
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-bold sm:text-5xl">{t("Your invitation is a few clicks away.", "ඔබේ ආරාධනය ක්ලික් කිහිපයක් දුරින්.")}</h2>
          <Link href={user ? "/dashboard" : "/signup"} className="btn-primary btn-lg mt-8">{t("Start for free", "නොමිලේ ආරම්භ කරන්න")} <ArrowRight className="size-5" /></Link>
        </section>
      </main>
      <footer className="border-t border-ink-200/70 py-8 text-center text-sm text-ink-500">© {new Date().getFullYear()} Wedding.lk — {t("Made with love in Sri Lanka", "ශ්‍රී ලංකාවේ ආදරයෙන් නිර්මිතයි")}</footer>
    </div>
  );
}
