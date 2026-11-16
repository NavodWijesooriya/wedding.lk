import type { ReactNode } from "react";
import { Brand } from "@/components/ui/Brand";
import { LangSwitch } from "@/components/ui/i18n";
import { Lotus } from "@/components/site/ornaments";
import { getT } from "@/lib/lang";

export async function AuthShell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  const { t } = await getT();
  return (
    <main id="main" className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-maroon-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <Lotus className="pointer-events-none absolute -bottom-10 -right-10 w-[28rem] text-gold-400 opacity-20" />
        <Brand light />
        <div className="relative max-w-md">
          <p className="font-display text-5xl font-semibold leading-[1.1]">{t("Your wedding invitation, beautifully online.", "ඔබේ මංගල ආරාධනය, අලංකාරව අන්තර්ජාලයේ.")}</p>
          <p className="mt-6 text-lg text-white/75">{t("Pick a design, add your details, and share one link with every guest. Sinhala and English, ready in minutes.", "සැලසුමක් තෝරා, විස්තර ඇතුළත් කර, සියලු අමුත්තන්ට එකම ලින්ක් එකක් බෙදා හරින්න. සිංහල සහ ඉංග්‍රීසි, මිනිත්තු කිහිපයකින්.")}</p>
        </div>
        <p className="relative text-sm text-white/50">© Wedding.lk</p>
      </aside>
      <section className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden"><Brand /></div>
          <LangSwitch />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-4xl font-bold text-ink-900">{title}</h1>
          <p className="mb-8 mt-2 text-ink-500">{sub}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
