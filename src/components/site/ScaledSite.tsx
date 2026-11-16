"use client";
import { useEffect, useRef, useState } from "react";
import type { Doc, Lang } from "@/lib/site/types";
import { SiteRenderer } from "./SiteRenderer";

/** Renders a website at a fixed virtual width and scales it to fit its container (thumbnails, device previews). */
export function ScaledSite({ doc, width = 1200, ratio = 0.62, lang, maxSections, className = "", scroll = false, live = false, slug }: {
  doc: Doc; width?: number; ratio?: number; lang?: Lang; maxSections?: number; className?: string; scroll?: boolean; live?: boolean; slug?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [innerH, setInnerH] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / width));
    ro.observe(el);
    setScale(el.clientWidth / width);
    return () => ro.disconnect();
  }, [width]);
  useEffect(() => {
    const el = inner.current;
    if (!el || !scroll) return;
    const ro = new ResizeObserver(() => setInnerH(el.offsetHeight));
    ro.observe(el);
    setInnerH(el.offsetHeight);
    return () => ro.disconnect();
  }, [scroll]);
  const shown = maxSections ? { ...doc, sections: (() => { let n = 0; return doc.sections.map((s) => (s.visible && n++ < maxSections ? s : { ...s, visible: false })); })() } : doc;
  const s = scale || 0.0001;
  if (scroll)
    return (
      <div ref={box} className={`relative h-full w-full overflow-y-auto overflow-x-hidden ${className}`}>
        <div style={{ height: innerH * s }}>
          <div ref={inner} style={{ width, transform: `scale(${s})`, transformOrigin: "top left" }}>
            <SiteRenderer doc={shown} lang={lang} live={live} slug={slug} animate={false} />
          </div>
        </div>
      </div>
    );
  return (
    <div ref={box} className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio: `1 / ${ratio}` }}>
      <div className="absolute left-0 top-0" style={{ width, transform: `scale(${s})`, transformOrigin: "top left", pointerEvents: "none" }} aria-hidden="true" inert>
        <SiteRenderer doc={shown} lang={lang} thumb />
      </div>
    </div>
  );
}
