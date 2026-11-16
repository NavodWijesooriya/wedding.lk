"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ElementStyle, ImageRef, ImageShape, Section } from "@/lib/site/types";
import { fontStack } from "@/lib/site/fonts";
import { getAt, hasImage, isL10n, mediaSrcSet, tr } from "@/lib/site/util";
import { metaOf } from "@/lib/site/defaults";
import { Placeholder } from "./ornaments";
import { useSite, type Sel, type SelKind } from "./context";

export function styleOf(st: ElementStyle | undefined): CSSProperties {
  if (!st) return {};
  const s: CSSProperties = {};
  if (st.size && st.size !== 100) (s as any).zoom = st.size / 100;
  if (st.font) s.fontFamily = fontStack(st.font);
  if (st.color) s.color = st.color;
  if (st.bg) {
    s.backgroundColor = st.bg;
    s.padding = ".15em .5em";
    s.borderRadius = "var(--r-sm)";
    s.width = "fit-content";
    (s as any).boxDecorationBreak = "clone";
  }
  if (st.align) {
    s.textAlign = st.align;
    if (st.bg) s.marginInline = st.align === "center" ? "auto" : st.align === "right" ? "0 0 0 auto" : "0 auto 0 0";
  }
  if (st.bold) s.fontWeight = 700;
  if (st.italic) s.fontStyle = "italic";
  return s;
}

type ElProps = {
  id: string;
  kind: SelKind;
  label: string;
  path?: string;
  hrefPath?: string;
  multiline?: boolean;
  sectionId?: string;
  as?: any;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  href?: string;
  gallery?: Sel["gallery"];
  shapeable?: boolean;
};

/** Wrapper that makes any element selectable in the editor and applies per-element style overrides. */
export function El({ id, kind, label, path, hrefPath, multiline, sectionId, as: TagProp = "div", className = "", style, children, gallery, shapeable, ...rest }: ElProps) {
  const c = useSite();
  const st = styleOf(c.doc.styles[id]);
  const Tag = c.thumb && (TagProp === "a" || TagProp === "button") ? "span" : TagProp;
  if (!c.edit) return <Tag className={className} style={{ ...style, ...st }} {...rest}>{children}</Tag>;
  const selected = c.edit.sel?.id === id;
  return (
    <Tag
      {...rest}
      className={className}
      style={{ ...style, ...st }}
      data-el
      data-selected={selected}
      data-label={label}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        if (kind !== "text") e.preventDefault();
        c.edit!.select({ id, kind, label, path, hrefPath, multiline, sectionId, gallery, shapeable });
      }}
    >
      {children}
    </Tag>
  );
}

/** Inline-editable localized text. */
export function T({ id, path, label, className = "", as = "p", multiline = false, fallback = "", sectionId }: {
  id: string; path: string; label: string; className?: string; as?: any; multiline?: boolean; fallback?: string; sectionId?: string;
}) {
  const c = useSite();
  const raw = getAt(c.doc, path);
  const text = tr(raw, c.lang);
  const ref = useRef<HTMLElement>(null);
  const editing = !!c.edit;
  const lang = c.lang;

  useEffect(() => {
    const el = ref.current;
    if (el && editing && document.activeElement !== el && el.innerText !== text) el.innerText = text;
  }, [text, editing]);

  const pre = multiline ? "whitespace-pre-line" : "";
  if (!editing) {
    if (!text && !fallback) return null;
    return (
      <El id={id} kind="text" label={label} as={as} className={`${className} ${pre}`} {...({ lang } as any)}>
        {text || fallback}
      </El>
    );
  }
  const commit = (value: string) => {
    const clean = multiline ? value.replace(/\n{3,}/g, "\n\n") : value.replace(/\n/g, " ");
    c.edit!.set(path, isL10n(raw) ? { ...raw, [lang]: clean } : clean);
  };
  const selected = c.edit!.sel?.id === id;
  const Tag = as as any;
  return (
    <Tag
      ref={ref}
      lang={lang}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={false}
      data-el
      data-editable
      data-selected={selected}
      data-label={label}
      data-ph={label}
      className={`${className} whitespace-pre-wrap`}
      style={styleOf(c.doc.styles[id])}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        c.edit!.select({ id, kind: "text", label, path, multiline, sectionId });
      }}
      onFocus={() => c.edit!.select({ id, kind: "text", label, path, multiline, sectionId })}
      onInput={(e: React.FormEvent<HTMLElement>) => commit(e.currentTarget.innerText)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline) { e.preventDefault(); (e.currentTarget as HTMLElement).blur(); }
      }}
    />
  );
}

/** A derived value (date, time…) that is edited through the side panel. */
export function F({ id, path, label, kind, className = "", as = "p", children }: {
  id: string; path: string; label: string; kind: "date" | "time"; className?: string; as?: any; children: ReactNode;
}) {
  return <El id={id} kind={kind} path={path} label={label} as={as} className={className}>{children}</El>;
}

const SHAPE: Record<ImageShape, string> = {
  rect: "",
  rounded: "rounded-[var(--r-md)]",
  arch: "rounded-t-full rounded-b-[var(--r-sm)]",
  circle: "rounded-full",
  oval: "rounded-[50%]",
};

export function Img({ id, path, label, className = "", ratio = "4/5", shape, kind = "scene", gallery, alt = "", priority }: {
  id: string; path: string; label: string; className?: string; ratio?: string; shape?: ImageShape; kind?: "couple" | "scene" | "person";
  gallery?: Sel["gallery"]; alt?: string; priority?: boolean;
}) {
  const c = useSite();
  const img = getAt(c.doc, path) as ImageRef | undefined;
  const sh = shape ?? img?.shape ?? "rounded";
  const cls = `relative overflow-hidden ${SHAPE[sh]} ${className}`;
  const style: CSSProperties = { aspectRatio: sh === "circle" ? "1/1" : ratio };
  const inner = hasImage(img) ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img.src}
      srcSet={mediaSrcSet(img.src)}
      sizes="(min-width: 768px) 50vw, 100vw"
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className="h-full w-full object-cover"
      style={{ objectPosition: `${img.x}% ${img.y}%`, transform: img.zoom > 1 ? `scale(${img.zoom})` : undefined, transformOrigin: `${img.x}% ${img.y}%` }}
    />
  ) : (
    <Placeholder kind={kind} />
  );
  return (
    <El id={id} kind="image" label={label} path={path} gallery={gallery} shapeable className={cls} style={style}>
      {inner}
    </El>
  );
}

export function Btn({ id, textPath, hrefPath, label, className = "" }: { id: string; textPath: string; hrefPath: string; label: string; className?: string }) {
  const c = useSite();
  const text = tr(getAt(c.doc, textPath), c.lang);
  const href = String(getAt(c.doc, hrefPath) ?? "#");
  if (!text) return null;
  return (
    <El id={id} kind="button" label={label} path={textPath} hrefPath={hrefPath} as="a" href={href} className={`btn-site ${className}`}>
      {text}
    </El>
  );
}

const PAD = { sm: "py-10 @3xl:py-12", md: "py-16 @3xl:py-20", lg: "py-24 @3xl:py-32" } as const;

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const c = useSite();
  const reduce = useReducedMotion();
  const mode = c.doc.theme.animation;
  if (!c.animate || reduce || mode === "none") return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: mode === "rise" ? 28 : 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Sec({ s, alt, children, inner = "max-w-3xl", className = "", bare }: {
  s: Section; alt: boolean; children: ReactNode; inner?: string; className?: string; bare?: boolean;
}) {
  const c = useSite();
  const st = s.style;
  const bg = st.bg ?? (alt ? "color-mix(in srgb, var(--primary) 6%, var(--bg))" : "var(--bg)");
  const hasBg = hasImage(st.bgImage);
  const dark = hasBg;
  const align = st.align ?? "center";
  const style: CSSProperties = { background: bg, color: dark ? "#fff" : st.color ?? undefined, textAlign: align };
  const body = (
    <>
      {hasBg && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={st.bgImage!.src} srcSet={mediaSrcSet(st.bgImage!.src)} sizes="100vw" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: `${st.bgImage!.x}% ${st.bgImage!.y}%` }} />
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(st.overlay ?? 40) / 100})` }} />
        </>
      )}
      <div className={`relative mx-auto px-6 @3xl:px-10 ${inner}`}>{children}</div>
    </>
  );
  const common = { id: s.type === "hero" ? undefined : `${s.type}-${s.id.slice(-4)}`, className: `relative overflow-hidden ${bare ? "" : PAD[st.padY ?? "md"]} ${className}`, style };
  if (!c.edit) return <section {...common}>{body}</section>;
  const selected = c.edit.sel?.id === s.id;
  return (
    <section
      {...common}
      data-el
      data-section
      data-selected={selected}
      data-label={metaOf(s.type).label.en}
      data-sec={s.id}
      onClick={(e) => { e.stopPropagation(); c.edit!.select({ id: s.id, kind: "section", label: metaOf(s.type).label.en, sectionId: s.id }); }}
    >
      {body}
    </section>
  );
}

export function SectionTitle({ s, eyebrow }: { s: Section; eyebrow?: string }) {
  return (
    <div className="mb-8 @3xl:mb-12">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <T id={`${s.id}.title`} path={`sections.${s.id}.props.title`} label="Heading" as="h2" className="font-heading text-3xl leading-tight @3xl:text-5xl" />
    </div>
  );
}
