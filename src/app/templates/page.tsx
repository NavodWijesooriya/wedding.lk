import { Brand } from "@/components/ui/Brand";
import { LangSwitch } from "@/components/ui/i18n";
import { TemplateGallery } from "@/components/TemplateGallery";
import { getUser } from "@/lib/auth";
import { getT } from "@/lib/lang";
import Link from "next/link";

export const metadata = { title: "Wedding website templates" };

export default async function Page() {
  const [user, { t }] = await Promise.all([getUser(), getT()]);
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Brand />
        <div className="flex items-center gap-3"><LangSwitch /><Link className="btn-primary" href={user ? "/dashboard" : "/signup"}>{user ? t("Dashboard", "උපකරණ පුවරුව") : t("Get started", "ආරම්භ කරන්න")}</Link></div>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-5 pb-20 pt-6">
        <h1 className="font-display text-5xl font-bold">{t("Wedding templates", "විවාහ සැලසුම්")}</h1>
        <p className="mb-10 mt-2 max-w-2xl text-lg text-ink-700">{t("Ten Sri Lankan-inspired designs. Every colour, font and photo is yours to change.", "ශ්‍රී ලාංකික ආභාෂයෙන් සැලසුම් දහයක්. සෑම වර්ණයක්, අකුරක් සහ ඡායාරූපයක්ම ඔබට වෙනස් කළ හැක.")}</p>
        <TemplateGallery hrefTemplate={user ? "/create?template={id}" : "/signup"} selectLabel={t("Use this design", "මෙම සැලසුම භාවිතා කරන්න")} />
      </main>
    </div>
  );
}
