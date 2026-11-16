"use client";
import { type Dispatch } from "react";
import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Bold, EyeOff, Eye, Italic, MousePointerClick, Plus, Trash2, RotateCcw } from "lucide-react";
import type { Doc, ElementStyle, L10n, Lang, Section } from "@/lib/site/types";
import { FONTS } from "@/lib/site/fonts";
import { getAt, isL10n, tr, uid } from "@/lib/site/util";
import { metaOf } from "@/lib/site/defaults";
import { useI18n } from "@/components/ui/i18n";
import type { Sel } from "@/components/site/context";
import { ColorField, Field, Group, ResetBtn, Segmented, Slider, Toggle } from "./controls";
import { GalleryManager, ImageField } from "./ImageField";
import type { EditorAction } from "./state";

type Props = { doc: Doc; sel: Sel | null; lang: Lang; dispatch: Dispatch<EditorAction>; select: (s: Sel | null) => void; openInfo: () => void; confirmDelete: (id: string) => void };

const themeSwatches = (d: Doc) => [d.theme.primary, d.theme.secondary, d.theme.text, d.theme.bg, "#ffffff", "#000000"];

export function LInput({ label, value, onChange, lang, multiline, placeholder }: { label: string; value: L10n | string | undefined; onChange: (v: L10n) => void; lang: Lang; multiline?: boolean; placeholder?: string }) {
  const base: L10n = isL10n(value) ? value : { en: String(value ?? ""), si: "" };
  const shown = base[lang];
  const common = { className: "input", lang, value: shown, placeholder, "aria-label": label, onChange: (e: any) => onChange({ ...base, [lang]: e.target.value }) };
  return (
    <Field label={label} hint={!shown && tr(base, lang) ? tr(base, lang).slice(0, 40) + "… (other language)" : undefined}>
      {multiline ? <textarea rows={4} {...common} /> : <input {...common} />}
    </Field>
  );
}

export function RightPanel(p: Props) {
  const { t } = useI18n();
  const { doc, sel } = p;
  if (!sel)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-ink-500">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-cream-200 text-maroon-600"><MousePointerClick className="size-7" /></span>
        <p className="font-display text-2xl font-bold text-ink-900">{t("Click anything to edit", "සංස්කරණයට ඕනෑම දෙයක් ක්ලික් කරන්න")}</p>
        <p className="text-sm">{t("Select a name, date, photo, button or whole section on the page. Its options appear here.", "පිටුවේ නමක්, දිනයක්, ඡායාරූපයක්, බොත්තමක් හෝ සම්පූර්ණ කොටසක් තෝරන්න. එහි විකල්ප මෙහි පෙනේ.")}</p>
      </div>
    );
  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-ink-200/70 bg-white px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-editor">{kindLabel(sel.kind, t)}</p>
          <h2 className="truncate font-display text-2xl font-bold leading-tight">{sel.label}</h2>
        </div>
        <button className="btn-ghost shrink-0 !px-2.5" onClick={() => p.select(null)}>{t("Done", "අවසන්")}</button>
      </div>
      {sel.kind === "text" && <TextPanel {...p} sel={sel} />}
      {(sel.kind === "date" || sel.kind === "time") && <DatePanel {...p} sel={sel} />}
      {sel.kind === "image" && <ImagePanel {...p} sel={sel} />}
      {sel.kind === "button" && <ButtonPanel {...p} sel={sel} />}
      {sel.kind === "section" && <SectionPanel {...p} sel={sel} />}
    </div>
  );
}

function kindLabel(k: Sel["kind"], t: (a: string, b: string) => string) {
  return { text: t("Text", "පෙළ"), date: t("Date", "දිනය"), time: t("Time", "වේලාව"), image: t("Image", "රූපය"), button: t("Button", "බොත්තම"), section: t("Section", "කොටස") }[k];
}

/* ---------------------------------------------------------------- typography */
function TypeControls({ id, doc, dispatch, bgToo = true }: { id: string; doc: Doc; dispatch: Dispatch<EditorAction>; bgToo?: boolean }) {
  const { t } = useI18n();
  const st: ElementStyle = doc.styles[id] ?? {};
  const set = (patch: Partial<ElementStyle>) => dispatch({ t: "style", id, patch });
  const sw = themeSwatches(doc);
  return (
    <>
      <Group title={t("Typography", "අකුරු")} action={Object.keys(st).length > 0 && <ResetBtn label={t("Reset style", "ශෛලිය යළි සකසන්න")} onClick={() => dispatch({ t: "style", id, patch: null })} />}>
        <Field label={t("Font", "අකුරු වර්ගය")}>
          <select className="input" value={st.font ?? ""} onChange={(e) => set({ font: e.target.value || undefined })} aria-label={t("Font", "අකුරු වර්ගය")}>
            <option value="">{t("Template default", "සැලසුමේ පෙරනිමිය")}</option>
            {FONTS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </Field>
        <Slider label={t("Size", "ප්‍රමාණය")} value={st.size ?? 100} min={50} max={220} step={5} suffix="%" onChange={(size) => set({ size: size === 100 ? undefined : size })} />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Segmented label={t("Alignment", "පෙළගැස්ම")} value={st.align} onChange={(align) => set({ align })} options={[
            { v: "left", label: <AlignLeft className="size-4" />, title: t("Align left", "වමට") }, { v: "center", label: <AlignCenter className="size-4" />, title: t("Align center", "මැදට") }, { v: "right", label: <AlignRight className="size-4" />, title: t("Align right", "දකුණට") },
          ]} />
          <div className="flex gap-1">
            <button type="button" aria-pressed={!!st.bold} aria-label={t("Bold", "තද")} onClick={() => set({ bold: st.bold ? undefined : true })} className={`btn-icon border border-ink-200 ${st.bold ? "bg-maroon-600/10 text-maroon-700" : ""}`}><Bold className="size-4" /></button>
            <button type="button" aria-pressed={!!st.italic} aria-label={t("Italic", "ඇල")} onClick={() => set({ italic: st.italic ? undefined : true })} className={`btn-icon border border-ink-200 ${st.italic ? "bg-maroon-600/10 text-maroon-700" : ""}`}><Italic className="size-4" /></button>
          </div>
        </div>
      </Group>
      <Group title={t("Colour", "වර්ණ")}>
        <ColorField label={t("Text colour", "අකුරු වර්ණය")} value={st.color} swatches={sw} onChange={(color) => set({ color })} onClear={() => set({ color: undefined })} />
        {bgToo && <ColorField label={t("Background colour", "පසුබිම් වර්ණය")} value={st.bg} swatches={sw} onChange={(bg) => set({ bg })} onClear={() => set({ bg: undefined })} />}
      </Group>
    </>
  );
}

/* ---------------------------------------------------------------- text */
function TextPanel({ doc, sel, lang, dispatch }: Props & { sel: Sel }) {
  const { t } = useI18n();
  const raw = getAt(doc, sel.path!);
  const text = tr(raw, lang);
  const own = isL10n(raw) ? raw[lang] : String(raw ?? "");
  const write = (v: string) => dispatch({ t: "set", path: sel.path!, value: isL10n(raw) ? { ...raw, [lang]: v } : v });
  return (
    <>
      <Group title={t("Content", "අන්තර්ගතය")}>
        {sel.multiline ? <textarea className="input min-h-32" lang={lang} value={own ?? ""} onChange={(e) => write(e.target.value)} aria-label={sel.label} /> : <input className="input" lang={lang} value={own ?? ""} onChange={(e) => write(e.target.value)} aria-label={sel.label} />}
        {isL10n(raw) && !own && text && <p className="hint">{lang === "si" ? t("No Sinhala text yet — showing English. Type here to add Sinhala.", "සිංහල පෙළ නැත — ඉංග්‍රීසි පෙන්වයි. සිංහල එක් කිරීමට මෙහි ටයිප් කරන්න.") : t("No English text yet — showing Sinhala. Type here to add English.", "ඉංග්‍රීසි පෙළ නැත — සිංහල පෙන්වයි. ඉංග්‍රීසි එක් කිරීමට මෙහි ටයිප් කරන්න.")}</p>}
        <p className="hint">{t("You can also type directly on the page.", "ඔබට පිටුවේම ටයිප් කළ හැක.")}</p>
      </Group>
      <TypeControls id={sel.id} doc={doc} dispatch={dispatch} />
    </>
  );
}

function DatePanel({ doc, sel, dispatch }: Props & { sel: Sel }) {
  const { t } = useI18n();
  const v = String(getAt(doc, sel.path!) ?? "");
  return (
    <>
      <Group title={sel.kind === "date" ? t("Date", "දිනය") : t("Time", "වේලාව")}>
        <input className="input" type={sel.kind} value={v} aria-label={sel.label} onChange={(e) => dispatch({ t: "set", path: sel.path!, value: e.target.value })} />
        <p className="hint">{t("Shown in the guest's language automatically.", "අමුත්තාගේ භාෂාවෙන් ස්වයංක්‍රීයව පෙන්වයි.")}</p>
      </Group>
      <TypeControls id={sel.id} doc={doc} dispatch={dispatch} />
    </>
  );
}

/* ---------------------------------------------------------------- image */
function ImagePanel({ doc, sel, dispatch, select }: Props & { sel: Sel }) {
  const { t } = useI18n();
  const g = sel.gallery;
  if (g && g.index < 0) {
    const sec = doc.sections.find((s) => s.id === g.sectionId)!;
    return <Group title={t("Gallery photos", "ගැලරි ඡායාරූප")}><GalleryManager images={sec.props.images ?? []} onChange={(images) => dispatch({ t: "props", id: sec.id, patch: { images } })} /></Group>;
  }
  const val = getAt(doc, sel.path!) ?? null;
  const set = (v: any) => {
    if (g && v === null) {
      const sec = doc.sections.find((s) => s.id === g.sectionId)!;
      dispatch({ t: "props", id: sec.id, patch: { images: (sec.props.images as any[]).filter((_, i) => i !== g.index) } });
      select(null);
    } else dispatch({ t: "set", path: sel.path!, value: v });
  };
  const sec = g ? doc.sections.find((s) => s.id === g.sectionId) : null;
  return (
    <>
      <Group title={t("Photo", "ඡායාරූපය")}>
        <ImageField value={val} onChange={set} ratio="4/3" shapes={!g} label={sel.label} />
      </Group>
      {sec && (
        <Group title={t("All gallery photos", "සියලු ගැලරි ඡායාරූප")}>
          <GalleryManager images={sec.props.images ?? []} selectedIndex={g!.index} onChange={(images) => dispatch({ t: "props", id: sec.id, patch: { images } })} onSelect={(i) => select({ id: `${sec.id}.img${i}`, kind: "image", label: `Photo ${i + 1}`, path: `sections.${sec.id}.props.images.${i}`, gallery: { sectionId: sec.id, index: i } })} />
        </Group>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- button */
function ButtonPanel({ doc, sel, lang, dispatch, openInfo }: Props & { sel: Sel }) {
  const { t } = useI18n();
  const label = sel.path ? getAt(doc, sel.path) : undefined;
  const href = sel.hrefPath ? String(getAt(doc, sel.hrefPath) ?? "") : undefined;
  return (
    <>
      <Group title={t("Button", "බොත්තම")}>
        {sel.path && <LInput label={t("Button text", "බොත්තමේ පෙළ")} value={label} lang={lang} onChange={(v) => dispatch({ t: "set", path: sel.path!, value: v })} />}
        {sel.hrefPath && (
          <Field label={sel.hrefPath === "info.mapUrl" ? t("Google Maps link", "Google Maps ලින්ක් එක") : t("Link", "සබැඳිය")} hint={sel.hrefPath === "info.mapUrl" ? t("Paste a share link from Google Maps. Leave empty to search your venue address.", "Google Maps බෙදාගැනීමේ ලින්ක් එකක් අලවන්න. හිස්ව තැබුවහොත් ස්ථාන ලිපිනය සෙවේ.") : t("Use #rsvp to jump to the RSVP section, or paste any web address.", "RSVP වෙත යාමට #rsvp භාවිතා කරන්න, හෝ ඕනෑම වෙබ් ලිපිනයක් අලවන්න.")}>
            <input className="input" value={href} placeholder="https://… or #rsvp" onChange={(e) => dispatch({ t: "set", path: sel.hrefPath!, value: e.target.value })} aria-label="Link" />
          </Field>
        )}
        {!sel.path && !sel.hrefPath && (
          <>
            <p className="text-sm text-ink-700">{t("Contact buttons come from your wedding details.", "සම්බන්ධතා බොත්තම් ඔබේ විවාහ විස්තරවලින් පැමිණේ.")}</p>
            <button className="btn-secondary" onClick={openInfo}>{t("Edit wedding details", "විවාහ විස්තර සංස්කරණය")}</button>
          </>
        )}
      </Group>
      <Group title={t("Button style", "බොත්තම් ශෛලිය")}>
        <ColorField label={t("Background", "පසුබිම")} value={doc.styles[sel.id]?.bg} swatches={themeSwatches(doc)} onChange={(bg) => dispatch({ t: "style", id: sel.id, patch: { bg } })} onClear={() => dispatch({ t: "style", id: sel.id, patch: { bg: undefined } })} />
        <ColorField label={t("Text colour", "අකුරු වර්ණය")} value={doc.styles[sel.id]?.color} swatches={themeSwatches(doc)} onChange={(color) => dispatch({ t: "style", id: sel.id, patch: { color } })} onClear={() => dispatch({ t: "style", id: sel.id, patch: { color: undefined } })} />
        <p className="hint">{t("Default colours come from Theme → Button colour.", "පෙරනිමි වර්ණ Theme → Button colour වෙතින් ලැබේ.")}</p>
      </Group>
    </>
  );
}

/* ---------------------------------------------------------------- section */
function SectionPanel({ doc, sel, lang, dispatch, select, confirmDelete }: Props & { sel: Sel }) {
  const { t } = useI18n();
  const idx = doc.sections.findIndex((s) => s.id === sel.sectionId);
  const s = doc.sections[idx];
  if (!s) return null;
  const meta = metaOf(s.type);
  const sw = themeSwatches(doc);
  const setProps = (patch: Record<string, any>) => dispatch({ t: "props", id: s.id, patch });
  const setStyle = (patch: any) => dispatch({ t: "sectionStyle", id: s.id, patch });
  const hasBg = !!s.style.bgImage?.src;
  return (
    <>
      <Group title={t("Section", "කොටස")}>
        <p className="text-sm text-ink-700">{meta.desc[lang]}</p>
        <div className="flex gap-1.5">
          <button className="btn-secondary flex-1" onClick={() => dispatch({ t: "toggle", id: s.id })}>{s.visible ? <><EyeOff className="size-4" />{t("Hide", "සඟවන්න")}</> : <><Eye className="size-4" />{t("Show", "පෙන්වන්න")}</>}</button>
          <button className="btn-icon border border-ink-200" aria-label={t("Move up", "ඉහළට")} disabled={idx === 0} onClick={() => dispatch({ t: "move", from: idx, to: idx - 1 })}><ArrowUp className="size-4" /></button>
          <button className="btn-icon border border-ink-200" aria-label={t("Move down", "පහළට")} disabled={idx === doc.sections.length - 1} onClick={() => dispatch({ t: "move", from: idx, to: idx + 1 })}><ArrowDown className="size-4" /></button>
          <button className="btn-icon border border-ink-200 text-red-600" aria-label={t("Delete section", "කොටස මකන්න")} onClick={() => confirmDelete(s.id)}><Trash2 className="size-4" /></button>
        </div>
      </Group>

      <SectionSpecific s={s} doc={doc} lang={lang} setProps={setProps} dispatch={dispatch} select={select} />

      <Group title={t("Appearance", "පෙනුම")} action={Object.keys(s.style).length > 0 && <ResetBtn label={t("Reset", "යළි සකසන්න")} onClick={() => dispatch({ t: "sectionStyle", id: s.id, patch: { bg: undefined, color: undefined, bgImage: undefined, overlay: undefined, padY: undefined, align: undefined } })} />}>
        <ColorField label={t("Background colour", "පසුබිම් වර්ණය")} value={s.style.bg} swatches={sw} onChange={(bg) => setStyle({ bg })} onClear={() => setStyle({ bg: undefined })} />
        <ColorField label={t("Text colour", "අකුරු වර්ණය")} value={s.style.color} swatches={sw} onChange={(color) => setStyle({ color })} onClear={() => setStyle({ color: undefined })} />
        <Field label={t("Spacing", "ඉඩ")}>
          <Segmented label="Spacing" value={s.style.padY ?? "md"} onChange={(padY) => setStyle({ padY })} options={[{ v: "sm", label: t("Compact", "සංක්ෂිප්ත") }, { v: "md", label: t("Normal", "සාමාන්‍ය") }, { v: "lg", label: t("Roomy", "විශාල") }]} />
        </Field>
        <Field label={t("Alignment", "පෙළගැස්ම")}>
          <Segmented label="Alignment" value={s.style.align ?? "center"} onChange={(align) => setStyle({ align })} options={[{ v: "left", label: <AlignLeft className="size-4" />, title: t("Left", "වම") }, { v: "center", label: <AlignCenter className="size-4" />, title: t("Center", "මැද") }, { v: "right", label: <AlignRight className="size-4" />, title: t("Right", "දකුණ") }]} />
        </Field>
      </Group>
      <Group title={t("Background photo", "පසුබිම් ඡායාරූපය")}>
        <ImageField value={s.style.bgImage ?? null} onChange={(bgImage) => setStyle({ bgImage: bgImage ?? undefined })} ratio="16/9" shapes={false} label={t("Background photo", "පසුබිම් ඡායාරූපය")} />
        {hasBg && <Slider label={t("Darken photo", "ඡායාරූපය අඳුරු කරන්න")} value={s.style.overlay ?? 40} min={0} max={85} suffix="%" onChange={(overlay) => setStyle({ overlay })} />}
      </Group>
    </>
  );
}

function SectionSpecific({ s, doc, lang, setProps, dispatch, select }: { s: Section; doc: Doc; lang: Lang; setProps: (p: Record<string, any>) => void; dispatch: Dispatch<EditorAction>; select: (s: Sel | null) => void }) {
  const { t } = useI18n();
  const p = s.props;
  switch (s.type) {
    case "hero":
      return (
        <Group title={t("Cover", "මුල් පිටුව")}>
          <Field label={t("Layout", "සැලැස්ම")}>
            <Segmented label="Layout" value={doc.theme.heroLayout} onChange={(heroLayout) => dispatch({ t: "theme", patch: { heroLayout } })} options={[{ v: "center", label: t("Centered", "මැද") }, { v: "split", label: t("Split", "බෙදූ") }, { v: "arch", label: t("Arch", "ආරුක්කු") }, { v: "full", label: t("Full photo", "සම්පූර්ණ") }]} />
          </Field>
          <Field label={t("Cover photo", "කවර ඡායාරූපය")}><ImageField value={p.image} onChange={(image) => setProps({ image })} ratio="4/3" shapes={false} /></Field>
          <Toggle label={t("Show button", "බොත්තම පෙන්වන්න")} checked={!!p.showCta} onChange={(showCta) => setProps({ showCta })} />
        </Group>
      );
    case "couple":
    case "story":
    case "venue":
      return <Group title={t("Photo", "ඡායාරූපය")}><ImageField value={p.image} onChange={(image) => setProps({ image })} ratio="4/3" label={t("Photo", "ඡායාරූපය")} defaultShape={s.type === "couple" ? "oval" : "rounded"} /></Group>;
    case "details":
      return (
        <Group title={t("Photos", "ඡායාරූප")}>
          <Field label={t("Bride", "මනාලිය")}><ImageField value={p.brideImage} onChange={(brideImage) => setProps({ brideImage })} ratio="1/1" defaultShape="circle" /></Field>
          <Field label={t("Groom", "මනාලයා")}><ImageField value={p.groomImage} onChange={(groomImage) => setProps({ groomImage })} ratio="1/1" defaultShape="circle" /></Field>
        </Group>
      );
    case "map":
      return (
        <Group title={t("Map", "සිතියම")}>
          <Field label={t("Search text (optional)", "සෙවුම් පෙළ (විකල්ප)")} hint={t("Defaults to your venue name and address.", "පෙරනිමිය ඔබේ ස්ථානයේ නම සහ ලිපිනයයි.")}>
            <input className="input" value={p.query ?? ""} onChange={(e) => setProps({ query: e.target.value })} placeholder="Mount Lavinia Hotel, Colombo" />
          </Field>
        </Group>
      );
    case "gallery":
      return (
        <Group title={t("Photos", "ඡායාරූප")}>
          <GalleryManager images={p.images ?? []} onChange={(images) => setProps({ images })} onSelect={(i) => select({ id: `${s.id}.img${i}`, kind: "image", label: `Photo ${i + 1}`, path: `sections.${s.id}.props.images.${i}`, gallery: { sectionId: s.id, index: i } })} />
          <Field label={t("Layout", "සැලැස්ම")}><Segmented label="Layout" value={p.layout} onChange={(layout) => setProps({ layout })} options={[{ v: "grid", label: t("Grid", "ජාලක") }, { v: "masonry", label: t("Collage", "කොලාජ්") }]} /></Field>
          <Field label={t("Photo shape", "ඡායාරූප හැඩය")}><Segmented label="Shape" value={p.shape} onChange={(shape) => setProps({ shape })} options={[{ v: "rect", label: "▭" }, { v: "rounded", label: "▢" }, { v: "arch", label: "⌓" }, { v: "circle", label: "●" }]} /></Field>
        </Group>
      );
    case "rsvp":
      return (
        <Group title={t("RSVP options", "RSVP විකල්ප")}>
          <Toggle label={t("Ask for number of guests", "අමුත්තන් ගණන විමසන්න")} checked={!!p.askGuests} onChange={(askGuests) => setProps({ askGuests })} />
          {p.askGuests && <Slider label={t("Max guests per reply", "පිළිතුරකට උපරිම අමුත්තන්")} value={Number(p.maxGuests) || 6} min={1} max={20} onChange={(maxGuests) => setProps({ maxGuests })} />}
          <Toggle label={t("Show WhatsApp reply button", "WhatsApp බොත්තම පෙන්වන්න")} checked={!!p.whatsapp} onChange={(whatsapp) => setProps({ whatsapp })} />
          <Field label={t("Reply by (optional)", "පිළිතුරු දිය යුතු දිනය (විකල්ප)")}><input type="date" className="input" value={p.deadline ?? ""} onChange={(e) => setProps({ deadline: e.target.value })} /></Field>
        </Group>
      );
    case "schedule":
      return <ScheduleEditor s={s} lang={lang} setProps={setProps} />;
    case "wishes":
      return <Group title={t("Guest wishes", "සුබ පැතුම්")}><p className="text-sm text-ink-700">{t("Wishes guests leave with their RSVP appear here after you publish. You can hide any of them from the Guests page.", "අමුත්තන් RSVP සමඟ තබන සුබ පැතුම් ප්‍රකාශ කිරීමෙන් පසු මෙහි පෙනේ. Guests පිටුවෙන් ඕනෑම එකක් සැඟවිය හැක.")}</p></Group>;
    default:
      return null;
  }
}

function ScheduleEditor({ s, lang, setProps }: { s: Section; lang: Lang; setProps: (p: Record<string, any>) => void }) {
  const { t } = useI18n();
  const items: any[] = s.props.items ?? [];
  const upd = (id: string, patch: any) => setProps({ items: items.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const mv = (i: number, d: number) => { const l = items.slice(); const [m] = l.splice(i, 1); l.splice(i + d, 0, m); setProps({ items: l }); };
  return (
    <Group title={t("Schedule items", "කාලසටහන් අයිතම")} action={<button className="inline-flex items-center gap-1 text-xs font-bold text-maroon-600" onClick={() => setProps({ items: [...items, { id: uid(), time: "12:00", title: { en: "New event", si: "නව සිදුවීම" }, desc: { en: "", si: "" } }] })}><Plus className="size-3.5" />{t("Add", "එක් කරන්න")}</button>}>
      {items.map((it, i) => (
        <div key={it.id} className="space-y-2 rounded-xl border border-ink-200 bg-cream-50 p-3">
          <div className="flex items-center gap-2">
            <input type="time" className="input !w-28 !py-1.5" value={it.time} aria-label={t("Time", "වේලාව")} onChange={(e) => upd(it.id, { time: e.target.value })} />
            <span className="ml-auto flex">
              <button className="btn-icon !size-8" disabled={i === 0} onClick={() => mv(i, -1)} aria-label={t("Move up", "ඉහළට")}><ArrowUp className="size-4" /></button>
              <button className="btn-icon !size-8" disabled={i === items.length - 1} onClick={() => mv(i, 1)} aria-label={t("Move down", "පහළට")}><ArrowDown className="size-4" /></button>
              <button className="btn-icon !size-8 text-red-600" onClick={() => setProps({ items: items.filter((x) => x.id !== it.id) })} aria-label={t("Remove", "ඉවත් කරන්න")}><Trash2 className="size-4" /></button>
            </span>
          </div>
          <input className="input !py-1.5" lang={lang} value={it.title?.[lang] ?? ""} placeholder={tr(it.title, lang)} aria-label={t("Event name", "සිදුවීම")} onChange={(e) => upd(it.id, { title: { ...it.title, [lang]: e.target.value } })} />
          <input className="input !py-1.5" lang={lang} value={it.desc?.[lang] ?? ""} placeholder={tr(it.desc, lang) || t("Details", "විස්තර")} aria-label={t("Details", "විස්තර")} onChange={(e) => upd(it.id, { desc: { ...it.desc, [lang]: e.target.value } })} />
        </div>
      ))}
      {!items.length && <p className="text-sm text-ink-500">{t("No events yet.", "සිදුවීම් නැත.")}</p>}
    </Group>
  );
}
