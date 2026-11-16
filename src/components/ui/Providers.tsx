"use client";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/site/types";
import { I18nProvider } from "./i18n";
import { ToastProvider } from "./toast";

export function Providers({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <I18nProvider initial={lang}><ToastProvider>{children}</ToastProvider></I18nProvider>;
}
