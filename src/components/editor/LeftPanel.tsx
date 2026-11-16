"use client";
import { useState, type Dispatch } from "react";
import * as Icons from "lucide-react";
import { Eye, EyeOff, GripVertical, Plus, Trash2, Wand2, ArrowUp, ArrowDown } from "lucide-react";
import type { Doc, Lang, SectionType } from "@/lib/site/types";
import { FONTS } from "@/lib/site/fonts";
import { PALETTES } from "@/lib/site/templates";
import { SECTION_META, metaOf } from "@/lib/site/defaults";
import { Dialog } from "@/components/ui/dialog";
import { useI18n } from "@/components/ui/i18n";
import { ColorField, Field, Group, Segmented } from "./controls";
import { LInput } from "./RightPanel";
import type { EditorAction } from "./state";

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const C = (Icons as any)[name] ?? Icons.Square;
  return <C className={className} />;
};

/* ----------------------------------------------------------------- sections */
export function SectionsTab({ doc, dispatch, onFocus, activeId, confirmDelete }: { doc: Doc; dispatch: Dispatch<EditorAction>; onFocus: (id: string) => void; activeId?: string; confirmDelete: (id: string) => void }) {
  const { t, lang } = useI18n();
  const [adding, setAdding] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const present = new Set(doc.sections.map((s) => s.type));
  return (
    <div className="p-3">
      <ul className="space-y-1.5" aria-label={t("Website sections", "වෙබ් අඩවි කොටස්")}>
        {doc.sections.map((s, i) => {
          const m = metaOf(s.type);
          return (
            <li key={s.id} draggable onDragStart={() => setDrag(i)} onDragEnd={() => { setDrag(null); setOver(null); }} onDragOver={(e) => { e.preventDefault(); setOver(i); }}
              onDrop={() => { if (drag !== null) dispatch({ t: "move", from: drag, to: i }); setDrag(null); setOver(null); }}
              className={`group flex items-center gap-1 rounded-xl border bg-white pr-1 transition ${activeId === s.id ? "border-editor ring-1 ring-editor" : "border-ink-200/80 hover:border-ink-300"} ${over === i && drag !== null && drag !== i ? "border-t-4 !border-t-maroon-500" : ""} ${drag === i ? "opacity-40" : ""}`}>
              <span className="cursor-grab px-1.5 py-3 text-ink-400" aria-hidden="true"><GripVertical className="size-4" /></span>
              <button type="button" onClick={() => onFocus(s.id)} className={`flex min-w-0 flex-1 items-center gap-2.5 py-2.5 text-left text-sm font-semibold ${s.visible ? "text-ink-900" : "text-ink-400"}`}>
                <Icon name={m.icon} className="size-4 shrink-0 text-maroon-600" />
                <span className="truncate">{m.label[lang]}</span>
              </button>
              <span className="flex items-center opacity-0 transition focus-within:opacity-100 group-hover:opacity-100 max-lg:opacity-100">
                <button className="btn-icon !size-7" disabled={i === 0} onClick={() => dispatch({ t: "move", from: i, to: i - 1 })} aria-label={`${t("Move up", "ඉහළට")}: ${m.label[lang]}`}><ArrowUp className="size-3.5" /></button>
                <button className="btn-icon !size-7" disabled={i === doc.sections.length - 1} onClick={() => dispatch({ t: "move", from: i, to: i + 1 })} aria-label={`${t("Move down", "පහළට")}: ${m.label[lang]}`}><ArrowDown className="size-3.5" /></button>
                <button className="btn-icon !size-7 text-red-600" onClick={() => confirmDelete(s.id)} aria-label={`${t("Delete", "මකන්න")}: ${m.label[lang]}`}><Trash2 className="size-3.5" /></button>
              </span>
              <button className="btn-icon !size-8" onClick={() => dispatch({ t: "toggle", id: s.id })} aria-pressed={!s.visible} aria-label={`${s.visible ? t("Hide", "සඟවන්න") : t("Show", "පෙන්වන්න")}: ${m.label[lang]}`}>
                {s.visible ? <Eye className="size-4" /> : <EyeOff className="size-4 text-ink-400" />}
              </button>
            </li>
          );
        })}
      </ul>
      {doc.sections.length === 0 && <p className="py-6 text-center text-sm text-ink-500">{t("Your page is empty. Add your first section.", "ඔබේ පිටුව හිස්ය. පළමු කොටස එක් කරන්න.")}</p>}
      <button className="btn-secondary mt-3 w-full border-dashed" onClick={() => setAdding(true)}><Plus className="size-4" /> {t("Add section", "කොටසක් එක් කරන්න")}</button>
      <p className="mt-3 px-1 text-xs text-ink-500">{t("Drag to reorder, or use the arrows. The eye hides a section without deleting it.", "අදින්න හෝ ඊතල භාවිතා කරන්න. ඇස මඟින් කොටසක් මකා නොදමා සඟවයි.")}</p>

      <Dialog open={adding} onClose={() => setAdding(false)} wide title={t("Add a section", "කොටසක් එක් කරන්න")}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTION_META.map((m) => {
            const disabled = m.single && present.has(m.type);
            return (
              <li key={m.type}>
                <button disabled={disabled} onClick={() => { dispatch({ t: "add", type: m.type as SectionType }); setAdding(false); }} className="flex h-full w-full items-start gap-3 rounded-2xl border border-ink-200 bg-white p-4 text-left transition hover:border-maroon-500 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-45">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-maroon-100 text-maroon-600"><Icon name={m.icon} className="size-5" /></span>
                  <span><span className="block font-bold">{m.label[lang]}</span><span className="block text-sm text-ink-500">{disabled ? t("Already on your page", "දැනටමත් පිටුවේ ඇත") : m.desc[lang]}</span></span>
                </button>
              </li>
            );
          })}
        </ul>
      </Dialog>
    </div>
  );
}

/* ----------------------------------------------------------------- theme */
export function ThemeTab({ doc, dispatch, openTemplates }: { doc: Doc; dispatch: Dispatch<EditorAction>; openTemplates: () => void }) {
  const { t, lang } = useI18n();
  const th = doc.theme;
  const set = (patch: Partial<Doc["theme"]>) => dispatch({ t: "theme", patch });
  return (
    <div>
      <Group title={t("Template", "සැලසුම")}>
        <button className="btn-secondary w-full" onClick={openTemplates}><Wand2 className="size-4" /> {t("Change template", "සැලසුම මාරු කරන්න")}</button>
        <p className="hint">{t("Switching keeps all your details and photos.", "මාරු කිරීමෙන් ඔබේ විස්තර සහ ඡායාරූප නොවැටේ.")}</p>
      </Group>
      <Group title={t("Colour palettes", "වර්ණ සංයුති")}>
        <ul className="grid grid-cols-2 gap-2">
          {PALETTES.map((p) => {
            const on = p.primary === th.primary && p.bg === th.bg && p.secondary === th.secondary;
            return (
              <li key={p.id}>
                <button type="button" aria-pressed={on} onClick={() => set({ primary: p.primary, secondary: p.secondary, bg: p.bg, text: p.text, button: p.button })} className={`w-full rounded-xl border p-2 text-left transition ${on ? "border-maroon-600 ring-1 ring-maroon-600" : "border-ink-200 hover:border-ink-300"}`}>
                  <span className="flex h-8 overflow-hidden rounded-md border border-black/5">{[p.bg, p.primary, p.secondary, p.text].map((c, i) => <i key={i} className="flex-1" style={{ background: c }} />)}</span>
                  <span className="mt-1.5 block truncate text-xs font-semibold">{p.name[lang]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Group>
      <Group title={t("Colours", "වර්ණ")}>
        <ColorField label={t("Primary colour", "ප්‍රධාන වර්ණය")} value={th.primary} onChange={(primary) => set({ primary })} />
        <ColorField label={t("Secondary colour", "ද්විතීය වර්ණය")} value={th.secondary} onChange={(secondary) => set({ secondary })} />
        <ColorField label={t("Background colour", "පසුබිම් වර්ණය")} value={th.bg} onChange={(bg) => set({ bg })} />
        <ColorField label={t("Text colour", "අකුරු වර්ණය")} value={th.text} onChange={(text) => set({ text })} />
        <ColorField label={t("Button colour", "බොත්තම් වර්ණය")} value={th.button} onChange={(button) => set({ button })} />
      </Group>
      <Group title={t("Fonts", "අකුරු")}>
        <Field label={t("Heading font", "ශීර්ෂ අකුරු")}>
          <select className="input" value={th.headingFont} onChange={(e) => set({ headingFont: e.target.value })} aria-label="Heading font">{FONTS.filter((f) => f.kind !== "body").map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}</select>
        </Field>
        <Field label={t("Body font", "ප්‍රධාන අකුරු")}>
          <select className="input" value={th.bodyFont} onChange={(e) => set({ bodyFont: e.target.value })} aria-label="Body font">{FONTS.filter((f) => f.kind !== "heading").map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}</select>
        </Field>
        <p className="hint">{t("Every font includes Sinhala fallback, so switching language never breaks the layout.", "සෑම අකුරු වර්ගයකටම සිංහල පසුබිම් අකුරු ඇත — භාෂාව මාරු කළ ද සැලසුම නොබිඳේ.")}</p>
      </Group>
      <Group title={t("Style", "ශෛලිය")}>
        <Field label={t("Corners", "කොන්")}><Segmented label="Corners" value={th.radius} onChange={(radius) => set({ radius })} options={[{ v: "sharp", label: t("Sharp", "තියුණු") }, { v: "soft", label: t("Soft", "මෘදු") }, { v: "round", label: t("Round", "වටකුරු") }]} /></Field>
        <Field label={t("Borders", "දාර")}><Segmented label="Borders" value={th.border} onChange={(border) => set({ border })} options={[{ v: "none", label: t("None", "නැත") }, { v: "thin", label: t("Thin", "සිහින්") }, { v: "double", label: t("Double", "ද්විත්ව") }]} /></Field>
        <Field label={t("Decorations", "සැරසිලි")}><Segmented label="Decorations" value={th.ornament} onChange={(ornament) => set({ ornament })} options={[{ v: "lotus", label: t("Lotus", "නෙළුම්") }, { v: "floral", label: t("Floral", "මල්") }, { v: "kandyan", label: t("Kandyan", "උඩරට") }, { v: "none", label: t("None", "නැත") }]} /></Field>
        <Field label={t("Animation", "සජීවීකරණය")}><Segmented label="Animation" value={th.animation} onChange={(animation) => set({ animation })} options={[{ v: "none", label: t("None", "නැත") }, { v: "fade", label: t("Fade", "මැකෙන") }, { v: "rise", label: t("Rise", "නැගෙන") }]} /></Field>
      </Group>
      <Group title={t("Website language", "වෙබ් අඩවි භාෂාව")}>
        <Segmented label="Default language" value={doc.lang as Lang} onChange={(l) => dispatch({ t: "lang", lang: l })} options={[{ v: "en", label: "English" }, { v: "si", label: "සිංහල" }]} />
        <p className="hint">{t("Language guests see first. They can always switch.", "අමුත්තන්ට පළමුව පෙනෙන භාෂාව. ඔවුන්ට ඕනෑම වේලාවක මාරු කළ හැක.")}</p>
      </Group>
    </div>
  );
}

/* ----------------------------------------------------------------- details */
export function InfoTab({ doc, lang, dispatch }: { doc: Doc; lang: Lang; dispatch: Dispatch<EditorAction> }) {
  const { t } = useI18n();
  const i = doc.info;
  const setI = (k: string, v: unknown) => dispatch({ t: "set", path: `info.${k}`, value: v });
  const L = (k: keyof typeof i, label: string, multiline?: boolean) => <LInput key={k} label={label} value={i[k] as any} lang={lang} multiline={multiline} onChange={(v) => setI(k, v)} />;
  const S = (k: keyof typeof i, label: string, type = "text", ph?: string) => (
    <Field label={label} key={k}><input className="input" type={type} value={i[k] as string} placeholder={ph} onChange={(e) => setI(k, e.target.value)} aria-label={label} /></Field>
  );
  return (
    <div>
      <p className="border-b border-ink-200/70 px-4 py-3 text-xs text-ink-500">{t("Editing in", "සංස්කරණය")}: <b>{lang === "en" ? "English" : "සිංහල"}</b> — {t("switch with the EN / සිං button above the page.", "පිටුවට ඉහළින් ඇති EN / සිං බොත්තමෙන් මාරු කරන්න.")}</p>
      <Group title={t("Couple", "යුවළ")}>{L("bride", t("Bride's name", "මනාලියගේ නම"))}{L("groom", t("Groom's name", "මනාලයාගේ නම"))}</Group>
      <Group title={t("Date & venue", "දිනය සහ ස්ථානය")}>
        {S("date", t("Wedding date", "විවාහ දිනය"), "date")}{S("time", t("Wedding time", "විවාහ වේලාව"), "time")}
        {L("venueName", t("Wedding venue", "විවාහ ස්ථානය"))}{L("venueAddress", t("Venue address", "ලිපිනය"), true)}
        {L("receptionName", t("Reception venue", "සත්කාර ස්ථානය"))}{L("receptionAddress", t("Reception address", "සත්කාර ලිපිනය"), true)}{S("receptionTime", t("Reception time", "සත්කාර වේලාව"), "time")}
        {S("mapUrl", t("Google Maps link", "Google Maps ලින්ක්"), "url", "https://maps.app.goo.gl/…")}
      </Group>
      <Group title={t("Families", "පවුල්")}>{L("brideParents", t("Bride's parents", "මනාලියගේ දෙමාපියන්"), true)}{L("groomParents", t("Groom's parents", "මනාලයාගේ දෙමාපියන්"), true)}</Group>
      <Group title={t("Words", "වචන")}>{L("message", t("Invitation message", "ආරාධනා පණිවිඩය"), true)}{L("story", t("Love story", "ආදර කතාව"), true)}</Group>
      <Group title={t("Contact", "සම්බන්ධතා")}>{S("phone", t("Phone", "දුරකථන"), "tel")}{S("whatsapp", "WhatsApp", "tel", "+94771234567")}{S("email", t("Email", "ඊමේල්"), "email")}</Group>
    </div>
  );
}
