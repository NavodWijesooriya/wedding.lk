"use client";
import { createContext, useContext } from "react";
import type { Doc, Lang, Wish } from "@/lib/site/types";

export type SelKind = "text" | "image" | "button" | "section" | "date" | "time";
export type Sel = {
  id: string; // element id (also key into doc.styles)
  kind: SelKind;
  path?: string; // value path inside doc
  label: string;
  multiline?: boolean;
  sectionId?: string;
  hrefPath?: string;
  gallery?: { sectionId: string; index: number };
  shapeable?: boolean;
};

export type EditApi = {
  sel: Sel | null;
  select: (s: Sel | null) => void;
  set: (path: string, value: unknown) => void;
};

export type SiteCtx = {
  doc: Doc;
  lang: Lang;
  edit: EditApi | null;
  wishes: Wish[];
  slug?: string;
  animate: boolean;
  /** When false the RSVP form is shown but does not submit (preview / editor). */
  live: boolean;
  /** Thumbnail mode: non-interactive, links rendered as spans. */
  thumb?: boolean;
};

export const Ctx = createContext<SiteCtx | null>(null);
export const useSite = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("SiteCtx missing");
  return c;
};
