"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, CloudUpload, Eye, Layers, Loader2, Monitor, Palette, Redo2, SlidersHorizontal, Smartphone, Tablet, Undo2, UserRound, Globe } from "lucide-react";
import type { Doc, Lang } from "@/lib/site/types";
import { applyTemplate, metaOf } from "@/lib/site/defaults";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import type { EditApi, Sel } from "@/components/site/context";
import { TemplateGallery } from "@/components/TemplateGallery";
import { Confirm, Dialog } from "@/components/ui/dialog";
import { useI18n } from "@/components/ui/i18n";
import { useToast } from "@/components/ui/toast";
import type { PublishState } from "@/app/actions/wedding";
import { InfoTab, SectionsTab, ThemeTab } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { PublishDialog } from "./PublishDialog";
import { useEditorState } from "./state";

export type { EditorAction } from "./state";
type Device = "desktop" | "tablet" | "mobile";
type Tab = "sections" | "theme" | "info";
const WIDTH: Record<Device, string> = { desktop: "100%", tablet: "820px", mobile: "390px" };

export function Editor({ initialDoc, initialState, origin, initialPanel }: { initialDoc: Doc; initialState: PublishState; origin: string; initialPanel?: string }) {
  const { t, lang: uiLang } = useI18n();
  const toast = useToast();
  const { doc, dispatch, status, savedAt, canUndo, canRedo, flush } = useEditorState(initialDoc);
  const [sel, setSel] = useState<Sel | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [canvasLang, setCanvasLang] = useState<Lang>(initialDoc.lang);
  const [tab, setTab] = useState<Tab>(initialPanel === "theme" || initialPanel === "info" ? initialPanel : "sections");
  const [drawer, setDrawer] = useState<"left" | "right" | null>(null);
  const [tplOpen, setTplOpen] = useState(initialPanel === "templates");
  const [pubOpen, setPubOpen] = useState(false);
  const [pub, setPub] = useState<PublishState>(initialState);
  const [delId, setDelId] = useState<string | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  const select = useCallback((s: Sel | null) => {
    setSel(s);
    if (s && window.matchMedia("(max-width: 1023px)").matches) setDrawer("right");
  }, []);

  const edit: EditApi = useMemo(() => ({ sel, select, set: (path, value) => dispatch({ t: "set", path, value }) }), [sel, select, dispatch]);

  // Clear selection if the selected section/element disappears (e.g. after undo or delete).
  useEffect(() => {
    if (sel?.sectionId && sel.kind === "section" && !doc.sections.some((s) => s.id === sel.sectionId)) setSel(null);
  }, [doc.sections, sel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.closest("input,textarea,select,[contenteditable]");
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !typing && e.key.toLowerCase() === "z") { e.preventDefault(); dispatch({ t: e.shiftKey ? "redo" : "undo" }); }
      else if (mod && !typing && e.key.toLowerCase() === "y") { e.preventDefault(); dispatch({ t: "redo" }); }
      else if (e.key === "Escape" && !document.querySelector('[role="dialog"]')) { setSel(null); (document.activeElement as HTMLElement)?.blur?.(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const focusSection = (id: string) => {
    const s = doc.sections.find((x) => x.id === id);
    if (!s) return;
    setSel({ id, kind: "section", label: metaOf(s.type).label.en, sectionId: id });
    frame.current?.querySelector(`[data-sec="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.matchMedia("(max-width: 1023px)").matches) setDrawer(null);
  };

  const removeSection = (id: string) => { dispatch({ t: "remove", id }); toast("success", t("Section deleted. You can undo this.", "කොටස මකා දැමුවා. ආපසු හැරවිය හැක.")); };
  const sections = doc.sections;
  const selSectionId = sel?.sectionId ?? (sel ? sections.find((s) => sel.id.startsWith(s.id))?.id : undefined);

  const saveLabel = status === "saving" ? t("Saving…", "සුරකිමින්…") : status === "unsaved" ? t("Unsaved changes", "සුරැකී නැත") : status === "error" ? t("Couldn't save", "සුරැකීමට නොහැකි විය") : t("All changes saved", "සියලු වෙනස්කම් සුරැකිණි");
  const live = pub.status === "published";

  return (
    <div className="flex h-dvh flex-col bg-cream-100 text-ink-900">
      {/* top bar */}
      <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-ink-200 bg-white px-2 sm:px-3">
        <Link href="/dashboard" className="btn-ghost !px-2.5" aria-label={t("Back to dashboard", "උපකරණ පුවරුවට ආපසු")}><ArrowLeft className="size-4" /><span className="hidden xl:inline">{t("Dashboard", "උපකරණ පුවරුව")}</span></Link>
        <div className="mx-1 hidden h-6 w-px bg-ink-200 sm:block" />
        <button className="btn-icon" onClick={() => dispatch({ t: "undo" })} disabled={!canUndo} aria-label={t("Undo", "පසුගමනය")} title="Ctrl+Z"><Undo2 className="size-4" /></button>
        <button className="btn-icon" onClick={() => dispatch({ t: "redo" })} disabled={!canRedo} aria-label={t("Redo", "නැවත කරන්න")} title="Ctrl+Shift+Z"><Redo2 className="size-4" /></button>

        <div className="mx-auto hidden items-center gap-2 md:flex">
          <div className="inline-flex rounded-xl border border-ink-200 bg-cream-50 p-0.5" role="group" aria-label={t("Preview size", "පෙරදසුන් ප්‍රමාණය")}>
            {([["desktop", Monitor, t("Desktop", "ඩෙස්ක්ටොප්")], ["tablet", Tablet, t("Tablet", "ටැබ්ලට්")], ["mobile", Smartphone, t("Mobile", "ජංගම")]] as const).map(([d, I, l]) => (
              <button key={d} aria-pressed={device === d} aria-label={l} title={l} onClick={() => setDevice(d)} className={`flex size-8 items-center justify-center rounded-[10px] transition ${device === d ? "bg-white text-maroon-700 shadow-sm" : "text-ink-500 hover:text-ink-900"}`}><I className="size-4" /></button>
            ))}
          </div>
          <div className="inline-flex rounded-xl border border-ink-200 bg-cream-50 p-0.5" role="group" aria-label={t("Editing language", "සංස්කරණ භාෂාව")}>
            {(["en", "si"] as const).map((l) => (
              <button key={l} aria-pressed={canvasLang === l} onClick={() => setCanvasLang(l)} className={`h-8 rounded-[10px] px-3 text-xs font-bold transition ${canvasLang === l ? "bg-white text-maroon-700 shadow-sm" : "text-ink-500 hover:text-ink-900"}`}>{l === "en" ? "EN" : "සිං"}</button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0" aria-live="polite">
          <span className={`hidden items-center gap-1.5 text-xs font-semibold lg:flex ${status === "error" ? "text-red-600" : "text-ink-500"}`}>
            {status === "saving" ? <Loader2 className="size-3.5 animate-spin" /> : status === "error" ? <AlertTriangle className="size-3.5" /> : status === "unsaved" ? <CloudUpload className="size-3.5" /> : <Check className="size-3.5 text-sage-600" />}
            {saveLabel}
          </span>
          {status === "error" && <button className="btn-secondary !min-h-8 !px-2.5 text-xs" onClick={() => flush()}>{t("Retry", "නැවත")}</button>}
          <Link href="/preview" target="_blank" className="btn-secondary !px-3" aria-label={t("Preview", "පෙරදසුන")}><Eye className="size-4" /><span className="hidden sm:inline">{t("Preview", "පෙරදසුන")}</span></Link>
          <button className="btn-primary !px-3.5" onClick={() => setPubOpen(true)}><Globe className="size-4" />{live ? t("Update", "යාවත්කාලීන") : t("Publish", "ප්‍රකාශ කරන්න")}</button>
        </div>
      </header>

      <div className="relative grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)_340px]">
        {drawer && <button aria-label="Close panel" className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden" onClick={() => setDrawer(null)} />}

        {/* left panel */}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-[88vw] max-w-sm flex-col border-r border-ink-200 bg-white pt-14 transition-transform duration-200 lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:pt-0 ${drawer === "left" ? "translate-x-0" : "-translate-x-full"}`} aria-label={t("Website structure", "වෙබ් අඩවි ව්‍යුහය")}>
          <div className="flex shrink-0 border-b border-ink-200" role="tablist">
            {([["sections", Layers, t("Sections", "කොටස්")], ["theme", Palette, t("Theme", "තේමාව")], ["info", UserRound, t("Details", "විස්තර")]] as const).map(([k, I, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`flex flex-1 flex-col items-center gap-0.5 border-b-2 py-2.5 text-xs font-bold transition ${tab === k ? "border-maroon-600 text-maroon-700" : "border-transparent text-ink-500 hover:text-ink-900"}`}><I className="size-[18px]" />{l}</button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto" role="tabpanel">
            {tab === "sections" && <SectionsTab doc={doc} dispatch={dispatch} onFocus={focusSection} activeId={selSectionId} confirmDelete={setDelId} />}
            {tab === "theme" && <ThemeTab doc={doc} dispatch={dispatch} openTemplates={() => setTplOpen(true)} />}
            {tab === "info" && <InfoTab doc={doc} lang={canvasLang} dispatch={dispatch} />}
          </div>
        </aside>

        {/* canvas */}
        <main className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-0 md:p-5" onClick={() => setSel(null)} id="main" aria-label={t("Website preview", "වෙබ් අඩවි පෙරදසුන")}>
          <div ref={frame} className="mx-auto min-h-full overflow-hidden bg-white shadow-lift transition-[max-width] duration-300 md:rounded-xl" style={{ maxWidth: WIDTH[device] }}>
            <SiteRenderer doc={doc} lang={canvasLang} edit={edit} />
          </div>
          <div className="h-24 lg:h-6" />
        </main>

        {/* right panel */}
        <aside className={`fixed inset-x-0 bottom-0 z-50 max-h-[72vh] overflow-y-auto rounded-t-3xl border-t border-ink-200 bg-white shadow-lift transition-transform duration-200 lg:static lg:z-auto lg:max-h-none lg:translate-y-0 lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none ${drawer === "right" ? "translate-y-0" : "translate-y-full"}`} aria-label={t("Edit options", "සංස්කරණ විකල්ප")}>
          <RightPanel doc={doc} sel={sel} lang={canvasLang} dispatch={dispatch} select={select} openInfo={() => { setTab("info"); setDrawer("left"); }} confirmDelete={setDelId} />
        </aside>
      </div>

      {/* mobile bottom bar */}
      <nav className="z-30 grid shrink-0 grid-cols-4 border-t border-ink-200 bg-white lg:hidden" aria-label="Editor">
        {([["sections", Layers, t("Sections", "කොටස්")], ["theme", Palette, t("Theme", "තේමාව")], ["info", UserRound, t("Details", "විස්තර")]] as const).map(([k, I, l]) => (
          <button key={k} onClick={() => { setTab(k); setDrawer("left"); }} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold text-ink-700"><I className="size-5" />{l}</button>
        ))}
        <button onClick={() => setCanvasLang(canvasLang === "en" ? "si" : "en")} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold text-ink-700"><SlidersHorizontal className="size-5" />{canvasLang === "en" ? "EN → සිං" : "සිං → EN"}</button>
      </nav>

      <Dialog open={tplOpen} onClose={() => setTplOpen(false)} wide title={t("Change template", "සැලසුම මාරු කරන්න")}>
        <p className="mb-5 text-ink-700">{t("Your names, photos and text stay exactly as they are — only the look changes. You can undo it right after.", "ඔබේ නම්, ඡායාරූප සහ පෙළ එලෙසම පවතී — පෙනුම පමණක් වෙනස් වේ. වහාම ආපසු හැරවිය හැක.")}</p>
        <TemplateGallery base={doc} selected={doc.template} selectLabel={t("Use this template", "මෙම සැලසුම භාවිතා කරන්න")} onSelect={(id) => { dispatch({ t: "replace", doc: applyTemplate(doc, id) }); setTplOpen(false); toast("success", t("Template changed. Your content is untouched.", "සැලසුම වෙනස් විය. ඔබේ අන්තර්ගතයට බලපෑමක් නැත.")); }} />
      </Dialog>
      <PublishDialog open={pubOpen} onClose={() => setPubOpen(false)} state={pub} setState={setPub} flush={async () => { await flush(); }} origin={origin} />
      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={() => delId && removeSection(delId)} title={t("Delete this section?", "මෙම කොටස මකන්නද?")} text={t("The section and its content will be removed from your page. You can undo this from the toolbar.", "කොටස සහ එහි අන්තර්ගතය ඔබේ පිටුවෙන් ඉවත් වේ. මෙවලම් තීරුවෙන් ආපසු හැරවිය හැක.")} confirmLabel={t("Delete section", "කොටස මකන්න")} />
      <span className="sr-only" aria-live="polite">{savedAt ? saveLabel : ""}</span>
    </div>
  );
}
