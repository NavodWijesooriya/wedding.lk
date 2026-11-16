import "server-only";
import { cookies } from "next/headers";
import type { Lang } from "./site/types";

export const LANG_COOKIE = "wl_lang";

export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return v === "si" ? "si" : "en";
}

/** Server-side bilingual helper: t("English", "සිංහල"). */
export async function getT() {
  const lang = await getLang();
  return { lang, t: (en: string, si: string) => (lang === "si" && si ? si : en) };
}
