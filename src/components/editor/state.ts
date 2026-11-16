"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { Doc, ElementStyle, Section, SectionStyle, Theme } from "@/lib/site/types";
import { setAt } from "@/lib/site/util";
import { newSection } from "@/lib/site/defaults";
import { saveDocAction } from "@/app/actions/wedding";
import type { SectionType } from "@/lib/site/types";

type State = { doc: Doc; past: Doc[]; future: Doc[]; tag: string; at: number; rev: number };
type Action =
  | { t: "set"; path: string; value: unknown }
  | { t: "style"; id: string; patch: Partial<ElementStyle> | null }
  | { t: "sectionStyle"; id: string; patch: Partial<SectionStyle> }
  | { t: "props"; id: string; patch: Record<string, any> }
  | { t: "theme"; patch: Partial<Theme> }
  | { t: "replace"; doc: Doc }
  | { t: "move"; from: number; to: number }
  | { t: "toggle"; id: string }
  | { t: "remove"; id: string }
  | { t: "add"; type: SectionType; after?: string }
  | { t: "lang"; lang: Doc["lang"] }
  | { t: "undo" } | { t: "redo" };

const LIMIT = 80;

function commit(s: State, doc: Doc, tag: string): State {
  const now = Date.now();
  // Coalesce rapid edits of the same thing (typing, dragging a slider) into one undo step.
  if (tag && s.tag === tag && now - s.at < 900) return { ...s, doc, at: now, rev: s.rev + 1 };
  return { doc, past: [...s.past.slice(-LIMIT), s.doc], future: [], tag, at: now, rev: s.rev + 1 };
}
const mapSec = (d: Doc, id: string, f: (s: Section) => Section): Doc => ({ ...d, sections: d.sections.map((s) => (s.id === id ? f(s) : s)) });

function reducer(s: State, a: Action): State {
  const d = s.doc;
  switch (a.t) {
    case "set": return commit(s, setAt(d, a.path, a.value), `set:${a.path}`);
    case "style": {
      const styles = { ...d.styles };
      if (a.patch === null) delete styles[a.id];
      else {
        const next: any = { ...(styles[a.id] ?? {}), ...a.patch };
        for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k];
        styles[a.id] = next;
      }
      return commit(s, { ...d, styles }, `style:${a.id}:${a.patch ? Object.keys(a.patch).join() : "reset"}`);
    }
    case "sectionStyle":
      return commit(s, mapSec(d, a.id, (x) => {
        const style: any = { ...x.style, ...a.patch };
        for (const k of Object.keys(style)) if (style[k] === undefined) delete style[k];
        return { ...x, style };
      }), `sstyle:${a.id}:${Object.keys(a.patch).join()}`);
    case "props": return commit(s, mapSec(d, a.id, (x) => ({ ...x, props: { ...x.props, ...a.patch } })), `props:${a.id}:${Object.keys(a.patch).join()}`);
    case "theme": return commit(s, { ...d, theme: { ...d.theme, ...a.patch } }, `theme:${Object.keys(a.patch).join()}`);
    case "replace": return commit(s, a.doc, "");
    case "move": {
      if (a.from === a.to || a.to < 0 || a.to >= d.sections.length) return s;
      const list = d.sections.slice();
      const [m] = list.splice(a.from, 1);
      list.splice(a.to, 0, m);
      return commit(s, { ...d, sections: list }, "");
    }
    case "toggle": return commit(s, mapSec(d, a.id, (x) => ({ ...x, visible: !x.visible })), "");
    case "remove": return commit(s, { ...d, sections: d.sections.filter((x) => x.id !== a.id) }, "");
    case "add": {
      const sec = newSection(a.type);
      const list = d.sections.slice();
      const at = a.after ? list.findIndex((x) => x.id === a.after) + 1 : list.length;
      // keep the footer last by default
      const footer = list.findIndex((x) => x.type === "footer");
      const idx = !a.after && footer >= 0 ? footer : at;
      list.splice(idx, 0, sec);
      return commit(s, { ...d, sections: list }, "");
    }
    case "lang": return commit(s, { ...d, lang: a.lang }, "");
    case "undo": {
      if (!s.past.length) return s;
      const prev = s.past[s.past.length - 1];
      return { doc: prev, past: s.past.slice(0, -1), future: [d, ...s.future], tag: "", at: 0, rev: s.rev + 1 };
    }
    case "redo": {
      if (!s.future.length) return s;
      const [nx, ...rest] = s.future;
      return { doc: nx, past: [...s.past, d], future: rest, tag: "", at: 0, rev: s.rev + 1 };
    }
  }
}

export type EditorAction = Action;
export type SaveStatus = "saved" | "unsaved" | "saving" | "error";

export function useEditorState(initial: Doc) {
  const [state, dispatch] = useReducer(reducer, { doc: initial, past: [], future: [], tag: "", at: 0, rev: 0 });
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const lastSaved = useRef(0);
  const inflight = useRef(false);
  const docRef = useRef(state.doc);
  docRef.current = state.doc;
  const revRef = useRef(0);
  revRef.current = state.rev;

  const flush = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    setStatus("saving");
    try {
      while (lastSaved.current !== revRef.current) {
        const rev = revRef.current;
        const r = await saveDocAction(docRef.current);
        if (!r.ok) { setStatus("error"); inflight.current = false; return; }
        lastSaved.current = rev;
        setSavedAt(r.updatedAt);
      }
      setStatus("saved");
    } catch {
      setStatus("error");
    }
    inflight.current = false;
  }, []);

  useEffect(() => {
    if (state.rev === lastSaved.current) return;
    setStatus((s) => (s === "saving" ? s : "unsaved"));
    const t = setTimeout(flush, 900);
    return () => clearTimeout(t);
  }, [state.rev, flush]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (lastSaved.current !== revRef.current) { e.preventDefault(); e.returnValue = ""; } };
    const onHide = () => { if (document.visibilityState === "hidden" && lastSaved.current !== revRef.current) flush(); };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("visibilitychange", onHide);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("visibilitychange", onHide); };
  }, [flush]);

  return { doc: state.doc, dispatch, status, savedAt, canUndo: state.past.length > 0, canRedo: state.future.length > 0, flush };
}
