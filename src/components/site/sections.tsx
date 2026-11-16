"use client";
import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, Clock, Check, Loader2 } from "lucide-react";
import type { Section } from "@/lib/site/types";
import { formatDate, formatTime, formatWeekday, getAt, hasImage, tr } from "@/lib/site/util";
import { useSite } from "./context";
import { Btn, El, F, Img, Reveal, Sec, SectionTitle, T } from "./primitives";
import { Divider, KandyanBand, Lotus } from "./ornaments";
import { submitRsvp } from "@/app/actions/rsvp";

type P = { s: Section; alt: boolean };

const names = (c: ReturnType<typeof useSite>) => ({
  bride: tr(c.doc.info.bride, c.lang),
  groom: tr(c.doc.info.groom, c.lang),
});

/* ------------------------------------------------------------------ HERO */
export function Hero({ s, alt }: P) {
  const c = useSite();
  const { info, theme } = c.doc;
  const layout = theme.heroLayout;
  const p = `sections.${s.id}.props`;
  const date = formatDate(info.date, c.lang);
  const venue = tr(info.venueName, c.lang);
  const framed = theme.border === "double";
  const Names = (
    <div className="font-heading leading-[1.15]">
      <T id="info.bride" path="info.bride" label="Bride's name" as="h1" fallback={c.lang === "si" ? "මනාලිය" : "Bride"} className="text-5xl @md:text-6xl @3xl:text-7xl" sectionId={s.id} />
      <span className="my-1 block text-3xl italic opacity-70 @3xl:text-4xl" style={{ color: "var(--secondary)" }}>&amp;</span>
      <T id="info.groom" path="info.groom" label="Groom's name" as="h1" fallback={c.lang === "si" ? "මනාලයා" : "Groom"} className="text-5xl @md:text-6xl @3xl:text-7xl" sectionId={s.id} />
    </div>
  );
  const Meta = (
    <div className="mt-6 space-y-1.5">
      {(date || c.edit) && (
        <F id={`${s.id}.date`} path="info.date" label="Wedding date" kind="date" as="p" className="text-lg tracking-wide @3xl:text-xl">
          {date || (c.lang === "si" ? "විවාහ දිනය තෝරන්න" : "Pick the wedding date")}
        </F>
      )}
      {venue && <T id={`${s.id}.venue`} path="info.venueName" label="Venue" className="opacity-80" />}
    </div>
  );
  const Cta = s.props.showCta && (
    <div className="mt-8">
      <Btn id={`${s.id}.cta`} textPath={`${p}.cta`} hrefPath={`${p}.ctaHref`} label="Button" />
    </div>
  );
  const Tag = <T id={`${s.id}.tagline`} path={`${p}.tagline`} label="Tagline" className="eyebrow mb-6" />;

  if (layout === "full") {
    const bgImg = s.style.bgImage ?? s.props.image;
    return (
      <section id="top" className="relative flex min-h-[78vh] items-center justify-center overflow-hidden text-white @3xl:min-h-[92vh]" style={{ background: "linear-gradient(160deg, var(--primary), color-mix(in srgb, var(--primary) 55%, black))", textAlign: s.style.align ?? "center" }}
        {...(c.edit ? { "data-el": true, "data-section": true, "data-sec": s.id, "data-selected": c.edit.sel?.id === s.id, "data-label": "Cover", onClick: (e: React.MouseEvent) => { e.stopPropagation(); c.edit!.select({ id: s.id, kind: "section", label: "Cover", sectionId: s.id }); } } : {})}>
        {hasImage(bgImg) ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bgImg.src} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: `${bgImg.x}% ${bgImg.y}%` }} fetchPriority="high" />
            <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(s.style.overlay ?? 45) / 100})` }} />
          </>
        ) : (
          <div className="absolute inset-0 opacity-20" style={{ color: "var(--secondary)" }}><KandyanBand className="absolute left-0 top-6" /><KandyanBand className="absolute bottom-6 left-0" /></div>
        )}
        <Reveal className="relative px-6 py-20">
          {Tag}
          {Names}
          <Divider ornament={theme.ornament} className="my-6 text-white" />
          {Meta}
          {Cta}
        </Reveal>
      </section>
    );
  }

  const image = (
    <Img id={`${s.id}.image`} path={`${p}.image`} label="Cover photo" ratio={layout === "split" ? "4/5" : layout === "arch" ? "3/4" : "1/1"} shape={layout === "arch" ? "arch" : layout === "split" ? "rounded" : "circle"} className={layout === "arch" ? "mx-auto w-64 @md:w-80" : layout === "split" ? "w-full" : "mx-auto w-44 @md:w-56"} kind="couple" priority alt={`${names(c).bride} & ${names(c).groom}`} />
  );

  if (layout === "split") {
    return (
      <Sec s={{ ...s, style: { ...s.style, padY: s.style.padY ?? "lg", align: s.style.align ?? "left" } }} alt={alt} inner="max-w-6xl" className="min-h-[70vh] flex items-center">
        <Reveal className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
          <div className="order-2 @3xl:order-1">
            {Tag}
            {Names}
            <Divider ornament={theme.ornament} className="my-6 !justify-start" />
            {Meta}
            {Cta}
          </div>
          <div className="order-1 @3xl:order-2">{image}</div>
        </Reveal>
      </Sec>
    );
  }

  return (
    <Sec s={{ ...s, style: { ...s.style, padY: s.style.padY ?? "lg" } }} alt={alt} inner="max-w-3xl" className="flex min-h-[80vh] items-center">
      <Reveal>
        <div className={framed ? "relative border border-[color:var(--secondary)] p-1.5" : ""}>
          <div className={`${framed ? "border border-[color:var(--secondary)]" : ""} px-4 py-12 @3xl:px-12 @3xl:py-16`}>
            {theme.ornament === "kandyan" && <KandyanBand className="mx-auto mb-8 max-w-xs" />}
            {Tag}
            {layout === "arch" && <div className="mb-8">{image}</div>}
            {layout === "center" && hasImage(s.props.image) && <div className="mb-8">{image}</div>}
            {layout === "center" && !hasImage(s.props.image) && c.edit && (
              <div className="mb-8"><Lotus className="mx-auto h-14 w-20" style={{ color: "var(--secondary)" }} /></div>
            )}
            {layout === "center" && !hasImage(s.props.image) && !c.edit && <Lotus className="mx-auto mb-8 h-14 w-20" style={{ color: "var(--secondary)" }} />}
            {Names}
            <Divider ornament={theme.ornament} className="my-6" />
            {Meta}
            {Cta}
          </div>
        </div>
      </Reveal>
    </Sec>
  );
}

/* ---------------------------------------------------------------- COUPLE */
export function Couple({ s, alt }: P) {
  const p = `sections.${s.id}.props`;
  return (
    <Sec s={s} alt={alt} inner="max-w-2xl">
      <Reveal>
        <Img id={`${s.id}.image`} path={`${p}.image`} label="Photo" shape="oval" ratio="4/5" className="mx-auto mb-8 w-44 @md:w-56" kind="couple" />
        <SectionTitle s={s} />
        <T id={`${s.id}.text`} path={`${p}.text`} label="Introduction" multiline className="text-base leading-relaxed opacity-85 @3xl:text-lg" />
      </Reveal>
    </Sec>
  );
}

/* ----------------------------------------------------------------- STORY */
export function Story({ s, alt }: P) {
  const p = `sections.${s.id}.props`;
  const c = useSite();
  const hasImg = hasImage(s.props.image) || !!c.edit;
  if (!c.edit && !tr(c.doc.info.story, c.lang) && !hasImage(s.props.image)) return null;
  return (
    <Sec s={s} alt={alt} inner="max-w-5xl">
      <Reveal>
        <div className={`grid items-center gap-10 ${hasImg ? "@3xl:grid-cols-2" : ""}`}>
          {hasImg && <Img id={`${s.id}.image`} path={`${p}.image`} label="Story photo" ratio="4/5" className="mx-auto w-full max-w-sm" kind="couple" />}
          <div className={hasImg ? "@3xl:text-left" : "mx-auto max-w-2xl"}>
            <SectionTitle s={s} />
            <T id={`${s.id}.text`} path="info.story" label="Our story" multiline className="text-base leading-[1.9] opacity-85 @3xl:text-lg" />
          </div>
        </div>
      </Reveal>
    </Sec>
  );
}

/* --------------------------------------------------------------- MESSAGE */
export function Message({ s, alt }: P) {
  const { doc } = useSite();
  return (
    <Sec s={s} alt={alt} inner="max-w-2xl">
      <Reveal>
        <Lotus className="mx-auto mb-5 h-10 w-16" style={{ color: "var(--secondary)" }} />
        <SectionTitle s={s} />
        <T id={`${s.id}.text`} path="info.message" label="Invitation message" multiline className="font-heading text-xl leading-[1.8] @3xl:text-2xl" />
        <Divider ornament={doc.theme.ornament} className="mt-10" />
      </Reveal>
    </Sec>
  );
}

/* ------------------------------------------------------------- COUNTDOWN */
export function Countdown({ s, alt }: P) {
  const c = useSite();
  const { date, time } = c.doc.info;
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = date ? new Date(`${date}T${time || "00:00"}:00+05:30`).getTime() : NaN;
  const diff = now !== null && !isNaN(target) ? Math.max(0, target - now) : null;
  const units = [
    { v: diff === null ? null : Math.floor(diff / 864e5), l: c.lang === "si" ? "දින" : "Days" },
    { v: diff === null ? null : Math.floor(diff / 36e5) % 24, l: c.lang === "si" ? "පැය" : "Hours" },
    { v: diff === null ? null : Math.floor(diff / 6e4) % 60, l: c.lang === "si" ? "මිනිත්තු" : "Minutes" },
    { v: diff === null ? null : Math.floor(diff / 1e3) % 60, l: c.lang === "si" ? "තත්පර" : "Seconds" },
  ];
  return (
    <Sec s={s} alt={alt} inner="max-w-3xl">
      <Reveal>
        <SectionTitle s={s} />
        {!date ? (
          <p className="opacity-60">{c.lang === "si" ? "කරුණාකර විවාහ දිනය තෝරන්න." : "Choose your wedding date to start the countdown."}</p>
        ) : diff === 0 ? (
          <p className="font-heading text-3xl">{c.lang === "si" ? "මංගල්‍යය ඇරඹී ඇත!" : "The celebration has begun!"}</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 @md:gap-4" role="timer" aria-live="off">
            {units.map((u) => (
              <div key={u.l} className="card px-1 py-5 @md:py-7">
                <div className="font-heading lining text-3xl @md:text-5xl" style={{ color: "var(--primary)" }}>{u.v === null ? "–" : String(u.v).padStart(2, "0")}</div>
                <div className="eyebrow mt-2 !text-[.65rem] @md:!text-xs">{u.l}</div>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </Sec>
  );
}

/* -------------------------------------------------------------- DATETIME */
export function DateTime({ s, alt }: P) {
  const c = useSite();
  const { info } = c.doc;
  const d = formatDate(info.date, c.lang);
  return (
    <Sec s={s} alt={alt} inner="max-w-3xl">
      <Reveal>
        <SectionTitle s={s} />
        <div className="card mx-auto max-w-md px-6 py-10">
          <F id={`${s.id}.weekday`} path="info.date" label="Wedding date" kind="date" className="eyebrow">{formatWeekday(info.date, c.lang) || (c.lang === "si" ? "දිනය" : "Date")}</F>
          <F id={`${s.id}.date`} path="info.date" label="Wedding date" kind="date" className="mt-3 font-heading text-3xl @md:text-4xl" as="p">{d || (c.lang === "si" ? "දිනයක් තෝරන්න" : "Pick a date")}</F>
          <F id={`${s.id}.time`} path="info.time" label="Wedding time" kind="time" className="mt-4 flex items-center justify-center gap-2 text-lg" as="p">
            <Clock className="size-4 opacity-60" />
            {formatTime(info.time, c.lang) || (c.lang === "si" ? "වේලාවක් තෝරන්න" : "Pick a time")}
          </F>
        </div>
      </Reveal>
    </Sec>
  );
}

/* ----------------------------------------------------------------- VENUE */
export function Venue({ s, alt }: P) {
  const c = useSite();
  const { info } = c.doc;
  const p = `sections.${s.id}.props`;
  const showReception = !!(info.receptionName.en || info.receptionName.si || c.edit);
  const card = (label: string, labelPath: string, namePath: string, addrPath: string, time: string, timePath: string, k: string) => (
    <div className="card px-6 py-8">
      <T id={`${s.id}.${k}label`} path={labelPath} label="Label" className="eyebrow" />
      <T id={`${s.id}.${k}name`} path={namePath} label={label} as="h3" className="mt-3 font-heading text-2xl @md:text-3xl" />
      <T id={`${s.id}.${k}addr`} path={addrPath} label="Address" multiline className="mt-2 opacity-75" />
      {(time || c.edit) && (
        <F id={`${s.id}.${k}time`} path={timePath} label="Time" kind="time" className="mt-3 inline-flex items-center gap-2 text-sm font-medium" as="p">
          <Clock className="size-4 opacity-60" /> {formatTime(time, c.lang) || (c.lang === "si" ? "වේලාව" : "Add time")}
        </F>
      )}
    </div>
  );
  return (
    <Sec s={s} alt={alt} inner="max-w-4xl">
      <Reveal>
        <SectionTitle s={s} />
        {(hasImage(s.props.image) || c.edit) && <Img id={`${s.id}.image`} path={`${p}.image`} label="Venue photo" ratio="16/7" className="mb-8 w-full" kind="scene" />}
        <div className={`grid gap-4 ${showReception ? "@3xl:grid-cols-2" : "mx-auto max-w-md"}`}>
          {card("Venue name", `${p}.weddingLabel`, "info.venueName", "info.venueAddress", info.time, "info.time", "w")}
          {showReception && card("Reception venue", `${p}.receptionLabel`, "info.receptionName", "info.receptionAddress", info.receptionTime, "info.receptionTime", "r")}
        </div>
      </Reveal>
    </Sec>
  );
}

/* ------------------------------------------------------------------- MAP */
export function MapSec({ s, alt }: P) {
  const c = useSite();
  const { info } = c.doc;
  const p = `sections.${s.id}.props`;
  const q = (s.props.query as string) || [info.venueName.en || info.venueName.si, info.venueAddress.en || info.venueAddress.si].filter(Boolean).join(", ");
  const link = info.mapUrl || (q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : "");
  return (
    <Sec s={s} alt={alt} inner="max-w-4xl">
      <Reveal>
        <SectionTitle s={s} />
        <div className="card overflow-hidden !p-0">
          {q ? (
            <iframe title="Map" className="block h-72 w-full border-0 @3xl:h-96" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`} style={c.edit ? { pointerEvents: "none" } : undefined} />
          ) : (
            <div className="flex h-56 items-center justify-center gap-2 opacity-60"><MapPin className="size-5" />{c.lang === "si" ? "ස්ථාන ලිපිනයක් එක් කරන්න" : "Add a venue address to show the map"}</div>
          )}
        </div>
        {link && (
          <div className="mt-6">
            <El id={`${s.id}.btn`} kind="button" label="Button" path={`${p}.button`} hrefPath="info.mapUrl" as="a" href={link} className="btn-site">
              <MapPin className="size-4" /> {tr(s.props.button, c.lang)}
            </El>
          </div>
        )}
      </Reveal>
    </Sec>
  );
}

/* -------------------------------------------------------------- SCHEDULE */
export function Schedule({ s, alt }: P) {
  const c = useSite();
  const items: any[] = s.props.items ?? [];
  return (
    <Sec s={s} alt={alt} inner="max-w-2xl">
      <Reveal>
        <SectionTitle s={s} />
        <ol className="relative space-y-8 text-left">
          <span className="absolute bottom-2 left-[5.25rem] top-2 w-px opacity-30 @md:left-[6.25rem]" style={{ background: "var(--secondary)" }} aria-hidden="true" />
          {items.map((it) => (
            <li key={it.id} className="relative flex gap-6 @md:gap-8">
              <F id={`${s.id}.${it.id}.t`} path={`sections.${s.id}.props.items.${it.id}.time`} label="Time" kind="time" className="w-16 shrink-0 pt-1 text-right font-heading text-lg @md:w-20" as="p">
                {formatTime(it.time, c.lang)}
              </F>
              <span className="absolute left-[4.95rem] top-3 size-2.5 rounded-full @md:left-[5.95rem]" style={{ background: "var(--secondary)", boxShadow: "0 0 0 4px var(--bg)" }} aria-hidden="true" />
              <div className="pl-6">
                <T id={`${s.id}.${it.id}.n`} path={`sections.${s.id}.props.items.${it.id}.title`} label="Event" as="h3" className="font-heading text-xl @md:text-2xl" />
                <T id={`${s.id}.${it.id}.d`} path={`sections.${s.id}.props.items.${it.id}.desc`} label="Details" className="mt-1 text-sm opacity-75 @md:text-base" />
              </div>
            </li>
          ))}
          {!items.length && <li className="text-center opacity-60">{c.lang === "si" ? "කාලසටහනට අයිතම එක් කරන්න" : "Add schedule items from the right panel"}</li>}
        </ol>
      </Reveal>
    </Sec>
  );
}

/* --------------------------------------------------------------- DETAILS */
export function Details({ s, alt }: P) {
  const p = `sections.${s.id}.props`;
  const card = (who: "bride" | "groom") => (
    <div className="card px-6 py-8">
      <Img id={`${s.id}.${who}img`} path={`${p}.${who}Image`} label={`${who === "bride" ? "Bride" : "Groom"} photo`} shape="circle" className="mx-auto mb-6 w-40 @md:w-48" kind="person" />
      <T id={`${s.id}.${who}role`} path={`${p}.${who}Role`} label="Role" className="eyebrow" />
      <T id={`${s.id}.${who}name`} path={`info.${who}`} label={who === "bride" ? "Bride's name" : "Groom's name"} as="h3" className="mt-2 font-heading text-3xl" />
      <T id={`${s.id}.${who}bio`} path={`${p}.${who}Bio`} label="About" multiline className="mt-3 text-sm leading-relaxed opacity-80 @md:text-base" />
    </div>
  );
  return (
    <Sec s={s} alt={alt} inner="max-w-4xl">
      <Reveal>
        <SectionTitle s={s} />
        <div className="grid gap-5 @3xl:grid-cols-2">{card("bride")}{card("groom")}</div>
      </Reveal>
    </Sec>
  );
}

/* --------------------------------------------------------------- PARENTS */
export function Parents({ s, alt }: P) {
  const p = `sections.${s.id}.props`;
  const col = (labelKey: string, path: string, id: string) => (
    <div className="px-4">
      <T id={`${s.id}.${id}l`} path={`${p}.${labelKey}`} label="Label" className="eyebrow" />
      <T id={`${s.id}.${id}`} path={path} label="Parents" multiline as="p" className="mt-3 font-heading text-2xl leading-snug @md:text-3xl" />
    </div>
  );
  return (
    <Sec s={s} alt={alt} inner="max-w-3xl">
      <Reveal>
        <SectionTitle s={s} />
        <div className="grid gap-10 @3xl:grid-cols-2 @3xl:divide-x" style={{ borderColor: "color-mix(in srgb, var(--text) 15%, transparent)" }}>
          {col("brideLabel", "info.brideParents", "bp")}
          {col("groomLabel", "info.groomParents", "gp")}
        </div>
      </Reveal>
    </Sec>
  );
}

/* --------------------------------------------------------------- GALLERY */
export function Gallery({ s, alt }: P) {
  const c = useSite();
  const imgs: any[] = s.props.images ?? [];
  const layout = s.props.layout ?? "grid";
  if (!c.edit && imgs.length === 0) return null;
  const ratios = layout === "masonry" ? ["3/4", "1/1", "4/5", "1/1", "3/4", "4/3"] : [];
  return (
    <Sec s={s} alt={alt} inner="max-w-5xl">
      <Reveal>
        <SectionTitle s={s} />
        {imgs.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-3" aria-label="Photo placeholders">
            {[0, 1, 2].map((i) => (
              <Img key={i} id={`${s.id}.ph${i}`} path={`sections.${s.id}.props.images.${i}`} label="Add a photo" className="w-full" ratio="1/1" shape={s.props.shape} gallery={{ sectionId: s.id, index: -1 }} />
            ))}
          </div>
        ) : (
          <div className={layout === "masonry" ? "columns-2 gap-3 @3xl:columns-3 [&>*]:mb-3" : "grid grid-cols-2 gap-3 @3xl:grid-cols-3"}>
            {imgs.map((im, i) => (
              <Img key={i} id={`${s.id}.img${i}`} path={`sections.${s.id}.props.images.${i}`} label={`Photo ${i + 1}`} className="w-full break-inside-avoid" ratio={ratios.length ? ratios[i % ratios.length] : "1/1"} shape={s.props.shape} gallery={{ sectionId: s.id, index: i }} alt={`${c.lang === "si" ? "ඡායාරූපය" : "Photo"} ${i + 1}`} />
            ))}
          </div>
        )}
      </Reveal>
    </Sec>
  );
}

/* ------------------------------------------------------------------ RSVP */
export function Rsvp({ s, alt }: P) {
  const c = useSite();
  const p = s.props;
  const si = c.lang === "si";
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "maybe">("yes");
  const [form, setForm] = useState({ name: "", guests: 1, phone: "", message: "" });
  const deadline = p.deadline ? formatDate(p.deadline, c.lang) : "";
  const wa = (c.doc.info.whatsapp || "").replace(/\D/g, "");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!c.live || !c.slug) { setErr(si ? "මෙය පෙරදසුනකි — පිළිතුරු සුරැකෙන්නේ නැත." : "This is a preview — responses are not saved."); setState("error"); return; }
    setState("sending");
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const r = await submitRsvp(c.slug, { name: form.name, attending, guests: attending === "yes" ? form.guests : 0, phone: form.phone, message: form.message, lang: c.lang, website: String(fd.get("website") || "") });
    if (r.ok) setState("done");
    else { setErr(r.error); setState("error"); }
  };
  const waText = encodeURIComponent(
    `${si ? "ආයුබෝවන්! මම" : "Hello! This is"} ${form.name || (si ? "[නම]" : "[name]")}. ${attending === "yes" ? (si ? `මම පැමිණෙමි (${form.guests}).` : `I will attend (${form.guests} guest${form.guests > 1 ? "s" : ""}).`) : attending === "no" ? (si ? "කණගාටුයි, මට පැමිණිය නොහැක." : "Sorry, I can't make it.") : si ? "මම තවම තහවුරු නැත." : "I may be able to attend."}`,
  );
  const field = "w-full rounded-[var(--r-sm)] border bg-transparent px-4 py-3 outline-none transition focus:ring-2";
  const ring = { borderColor: "color-mix(in srgb, var(--text) 25%, transparent)", ["--tw-ring-color" as any]: "var(--secondary)" };

  return (
    <Sec s={s} alt={alt} inner="max-w-xl">
      <div id="rsvp" className="absolute -top-16" />
      <Reveal>
        <SectionTitle s={s} />
        <T id={`${s.id}.sub`} path={`sections.${s.id}.props.subtitle`} label="Subtitle" className="-mt-4 mb-2 opacity-80" />
        {deadline && <p className="mb-6 text-sm opacity-70">{si ? "අවසාන දිනය" : "Reply by"} {deadline}</p>}
        {state === "done" ? (
          <div className="card px-6 py-10" role="status">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full" style={{ background: "var(--primary)", color: "var(--bg)" }}><Check className="size-6" /></div>
            <p className="font-heading text-2xl">{si ? "ස්තූතියි! ඔබගේ පිළිතුර ලැබුණා." : "Thank you! Your response has been received."}</p>
            {wa && p.whatsapp && <a className="btn-site mt-6" href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" /> {si ? "WhatsApp හරහා දන්වන්න" : "Also tell us on WhatsApp"}</a>}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card space-y-4 px-5 py-7 text-left @md:px-8" noValidate>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{si ? "ඔබගේ නම" : "Your name"} *</span>
              <input required maxLength={80} className={field} style={ring} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
            </label>
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">{si ? "ඔබට පැමිණිය හැකිද?" : "Will you attend?"} *</legend>
              <div className="grid grid-cols-3 gap-2">
                {([["yes", si ? "පැමිණෙමි" : "Joyfully accept"], ["maybe", si ? "තහවුරු නැත" : "Maybe"], ["no", si ? "නොහැක" : "Regretfully decline"]] as const).map(([v, l]) => (
                  <label key={v} className="cursor-pointer">
                    <input type="radio" name="attending" className="peer sr-only" checked={attending === v} onChange={() => setAttending(v)} />
                    <span className="flex h-full min-h-12 items-center justify-center rounded-[var(--r-sm)] border px-2 py-2 text-center text-sm leading-tight transition peer-checked:font-semibold peer-focus-visible:ring-2" style={attending === v ? { background: "var(--primary)", color: "var(--bg)", borderColor: "var(--primary)", ["--tw-ring-color" as any]: "var(--secondary)" } : ring}>{l}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {attending === "yes" && p.askGuests && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">{si ? "අමුත්තන් ගණන (ඔබ ඇතුළුව)" : "Number of guests (including you)"}</span>
                <select className={field} style={ring} value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}>
                  {Array.from({ length: Math.min(20, Math.max(1, Number(p.maxGuests) || 6)) }, (_, i) => <option key={i} value={i + 1} style={{ color: "#222" }}>{i + 1}</option>)}
                </select>
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{si ? "දුරකථන (විකල්ප)" : "Phone (optional)"}</span>
              <input type="tel" maxLength={30} className={field} style={ring} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{si ? "සුබ පැතුමක් (විකල්ප)" : "A wish for the couple (optional)"}</span>
              <textarea rows={3} maxLength={500} className={field} style={ring} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </label>
            {state === "error" && <p role="alert" className="text-sm font-medium" style={{ color: "#c0392b" }}>{err}</p>}
            <div className="flex flex-col gap-3 pt-2 @md:flex-row">
              <El id={`${s.id}.submit`} kind="button" label="Button" path={`sections.${s.id}.props.button`} as="button" {...({ type: "submit", disabled: state === "sending" } as any)} className="btn-site flex-1">
                {state === "sending" && <Loader2 className="size-4 animate-spin" />} {tr(p.button, c.lang)}
              </El>
              {wa && p.whatsapp && (
                <a className="btn-site btn-outline" href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" /> WhatsApp</a>
              )}
            </div>
          </form>
        )}
      </Reveal>
    </Sec>
  );
}

/* ---------------------------------------------------------------- WISHES */
export function Wishes({ s, alt }: P) {
  const c = useSite();
  const sample = !c.live;
  const list = sample && c.wishes.length === 0
    ? [{ id: "a", name: c.lang === "si" ? "ඥාති මිතුරු" : "A dear friend", message: c.lang === "si" ? "ඔබ දෙදෙනාට සදා සතුට වේවා!" : "Wishing you a lifetime of love and laughter!", created_at: 0 }]
    : c.wishes;
  return (
    <Sec s={s} alt={alt} inner="max-w-3xl">
      <Reveal>
        <SectionTitle s={s} />
        {list.length === 0 ? (
          <T id={`${s.id}.empty`} path={`sections.${s.id}.props.emptyText`} label="Empty message" className="opacity-70" />
        ) : (
          <ul className="grid gap-4 text-left @3xl:grid-cols-2">
            {list.map((w) => (
              <li key={w.id} className="card px-6 py-6">
                <p className="leading-relaxed">“{w.message}”</p>
                <p className="mt-4 text-sm font-semibold" style={{ color: "var(--primary)" }}>— {w.name}</p>
              </li>
            ))}
          </ul>
        )}
        {sample && c.wishes.length === 0 && <p className="mt-4 text-xs opacity-50">{c.lang === "si" ? "නියැදි පණිවිඩයකි — සැබෑ පණිවිඩ ප්‍රකාශිත අඩවියේ පෙනේ." : "Sample message — real wishes appear on your published site."}</p>}
      </Reveal>
    </Sec>
  );
}

/* --------------------------------------------------------------- CONTACT */
export function Contact({ s, alt }: P) {
  const c = useSite();
  const { info } = c.doc;
  const wa = info.whatsapp.replace(/\D/g, "");
  const items = [
    info.phone && { icon: Phone, label: info.phone, href: `tel:${info.phone.replace(/\s/g, "")}`, path: "info.phone" },
    wa && { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/${wa}`, path: "info.whatsapp" },
    info.email && { icon: Mail, label: info.email, href: `mailto:${info.email}`, path: "info.email" },
  ].filter(Boolean) as any[];
  return (
    <Sec s={s} alt={alt} inner="max-w-2xl">
      <Reveal>
        <SectionTitle s={s} />
        <T id={`${s.id}.sub`} path={`sections.${s.id}.props.subtitle`} label="Subtitle" className="-mt-4 mb-8 opacity-80" />
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((it) => (
            <El key={it.href} id={`${s.id}.${it.path}`} kind="button" label="Contact" as="a" href={it.href} className="btn-site btn-outline" {...({ target: "_blank", rel: "noopener noreferrer" } as any)}>
              <it.icon className="size-4" /> {it.label}
            </El>
          ))}
          {!items.length && <p className="opacity-60">{c.lang === "si" ? "සම්බන්ධතා තොරතුරු එක් කරන්න" : "Add contact details in the Wedding Info panel"}</p>}
        </div>
      </Reveal>
    </Sec>
  );
}

/* ---------------------------------------------------------------- FOOTER */
export function Footer({ s, alt }: P) {
  const c = useSite();
  const { bride, groom } = names(c);
  return (
    <Sec s={{ ...s, style: { ...s.style, padY: s.style.padY ?? "sm" } }} alt={alt} inner="max-w-2xl">
      <Reveal>
        <Divider ornament={c.doc.theme.ornament} className="mb-6" />
        <T id={`${s.id}.text`} path={`sections.${s.id}.props.text`} label="Closing text" className="font-heading text-xl italic" />
        <p className="mt-3 font-heading text-2xl">{bride || (c.lang === "si" ? "මනාලිය" : "Bride")} &amp; {groom || (c.lang === "si" ? "මනාලයා" : "Groom")}</p>
        <T id={`${s.id}.tag`} path={`sections.${s.id}.props.hashtag`} label="Hashtag" className="mt-1 text-sm opacity-70" />
        <p className="mt-8 text-xs opacity-40">Made with Wedding.lk</p>
      </Reveal>
    </Sec>
  );
}
