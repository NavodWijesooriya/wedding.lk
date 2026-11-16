"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/site/types";

type I18n = { lang: Lang; t: (en: string, si: string) => string; setLang: (l: Lang) => void };
const C = createContext<I18n>({ lang: "en", t: (e) => e, setLang: () => {} });

export function I18nProvider({ initial, children }: { initial: Lang; children: ReactNode }) {
  const [lang, setL] = useState<Lang>(initial);
  const router = useRouter();
  const setLang = useCallback((l: Lang) => {
    document.cookie = `wl_lang=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
    setL(l);
    router.refresh();
  }, [router]);
  const t = useCallback((en: string, si: string) => (lang === "si" && si ? si : en), [lang]);
  return <C.Provider value={{ lang, t, setLang }}>{children}</C.Provider>;
}
export const useI18n = () => useContext(C);

export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`inline-flex rounded-full border border-ink-200 bg-white p-0.5 text-xs font-semibold ${className}`} role="group" aria-label="Language">
      {(["en", "si"] as const).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} className={`rounded-full px-3 py-1.5 transition ${lang === l ? "bg-maroon-600 text-white" : "text-ink-700 hover:bg-ink-900/5"}`}>
          {l === "en" ? "English" : "සිංහල"}
        </button>
      ))}
    </div>
  );
}
