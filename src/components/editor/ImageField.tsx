"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import type { ImageRef, ImageShape } from "@/lib/site/types";
import { mediaSrcSet } from "@/lib/site/util";
import { useI18n } from "@/components/ui/i18n";
import { useToast } from "@/components/ui/toast";
import { Segmented, Slider } from "./controls";

export async function uploadImage(file: File): Promise<string> {
  if (!/^image\//.test(file.type)) throw new Error("Please choose an image file (JPG, PNG or WebP).");
  if (file.size > 10 * 1024 * 1024) throw new Error("Image is larger than 10 MB.");
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Upload failed. Please try again.");
  return j.src as string;
}

export function useUploader() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<string | null>(null);
  const run = async (file: File): Promise<string | null> => {
    setBusy(true);
    setLocal(URL.createObjectURL(file));
    try {
      return await uploadImage(file);
    } catch (e: any) {
      toast("error", e.message);
      return null;
    } finally {
      setBusy(false);
      setLocal(null);
    }
  };
  return { busy, local, run };
}

export function ImageField({ value, onChange, ratio = "4/3", shapes = true, label, defaultShape = "rounded" }: {
  value: ImageRef | undefined; onChange: (v: ImageRef) => void; ratio?: string; shapes?: boolean; label?: string; defaultShape?: ImageShape;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const { busy, local, run } = useUploader();
  const [drag, setDrag] = useState(false);
  const has = !!value?.src;

  const pick = async (file?: File | null) => {
    if (!file) return;
    const src = await run(file);
    if (src) onChange({ src, x: 50, y: 50, zoom: 1, shape: value?.shape ?? defaultShape });
  };

  return (
    <div className="space-y-3">
      <div
        className={`relative overflow-hidden rounded-xl border-2 border-dashed bg-cream-100 transition ${drag ? "border-maroon-500 bg-maroon-100" : "border-ink-200"}`}
        style={{ aspectRatio: ratio }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
      >
        {local || has ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={local ?? value!.src}
            srcSet={!local && value ? mediaSrcSet(value.src) : undefined}
            sizes="320px"
            alt=""
            className="size-full cursor-crosshair object-cover"
            style={value && !local ? { objectPosition: `${value.x}% ${value.y}%`, transform: value.zoom > 1 ? `scale(${value.zoom})` : undefined, transformOrigin: `${value.x}% ${value.y}%` } : undefined}
            onClick={(e) => {
              if (!value || local) return;
              const r = e.currentTarget.getBoundingClientRect();
              onChange({ ...value, x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) });
            }}
            draggable={false}
          />
        ) : (
          <button type="button" className="flex size-full flex-col items-center justify-center gap-1 text-ink-500 hover:text-maroon-600" onClick={() => input.current?.click()}>
            <ImagePlus className="size-7" />
            <span className="text-sm font-semibold">{t("Add a photo", "ඡායාරූපයක් එක් කරන්න")}</span>
            <span className="text-xs">{t("Click or drop an image here", "ක්ලික් කරන්න හෝ මෙතැනට දමන්න")}</span>
          </button>
        )}
        {busy && <div className="absolute inset-0 flex items-center justify-center bg-white/60"><Loader2 className="size-6 animate-spin text-maroon-600" /></div>}
      </div>
      <input ref={input} type="file" accept="image/*" className="sr-only" aria-label={label ?? t("Upload image", "රූපය උඩුගත කරන්න")} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="flex gap-2">
        <button type="button" className="btn-secondary flex-1" onClick={() => input.current?.click()} disabled={busy}><Upload className="size-4" />{has ? t("Replace", "මාරු කරන්න") : t("Upload", "උඩුගත කරන්න")}</button>
        {has && <button type="button" className="btn-secondary text-red-600" onClick={() => onChange(null)} aria-label={t("Remove image", "රූපය ඉවත් කරන්න")}><Trash2 className="size-4" /></button>}
      </div>
      {has && value && (
        <>
          <p className="hint -mt-1">{t("Tip: click the photo to choose what stays in focus.", "ඉඟිය: ඡායාරූපය ක්ලික් කර කේන්ද්‍රය තෝරන්න.")}</p>
          <Slider label={t("Zoom", "විශාලනය")} value={value.zoom} min={1} max={3} step={0.05} suffix="×" onChange={(zoom) => onChange({ ...value, zoom })} />
          <Slider label={t("Horizontal position", "තිරස් පිහිටීම")} value={value.x} min={0} max={100} suffix="%" onChange={(x) => onChange({ ...value, x })} />
          <Slider label={t("Vertical position", "සිරස් පිහිටීම")} value={value.y} min={0} max={100} suffix="%" onChange={(y) => onChange({ ...value, y })} />
          {shapes && (
            <div>
              <span className="label">{t("Shape", "හැඩය")}</span>
              <Segmented label="Shape" value={value.shape ?? defaultShape} onChange={(shape) => onChange({ ...value, shape })} options={[
                { v: "rect", label: "▭", title: t("Square corners", "සෘජුකෝණ") }, { v: "rounded", label: "▢", title: t("Rounded", "වටකුරු කොන්") },
                { v: "arch", label: "⌓", title: t("Arch", "ආරුක්කුව") }, { v: "oval", label: "⬭", title: t("Oval", "ඕවල්") }, { v: "circle", label: "●", title: t("Circle", "කවය") },
              ]} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Multi-photo manager for the gallery (add many, reorder, remove). */
export function GalleryManager({ images, onChange, onSelect, selectedIndex }: { images: NonNullable<ImageRef>[]; onChange: (v: NonNullable<ImageRef>[]) => void; onSelect?: (i: number) => void; selectedIndex?: number }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const { busy, run } = useUploader();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    let list = images.slice();
    for (const f of Array.from(files).slice(0, 12)) {
      const src = await run(f);
      if (src) { list = [...list, { src, x: 50, y: 50, zoom: 1 }]; onChange(list); }
    }
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const l = images.slice(); const [m] = l.splice(from, 1); l.splice(to, 0, m); onChange(l);
  };
  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-3 gap-2">
        {images.map((im, i) => (
          <li key={im.src + i} draggable onDragStart={() => setDragIdx(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragIdx !== null) move(dragIdx, i); setDragIdx(null); }}
            className={`group relative aspect-square cursor-grab overflow-hidden rounded-lg border-2 ${selectedIndex === i ? "border-editor" : "border-transparent"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={im.src.replace(".webp", "-s.webp")} alt="" className="size-full object-cover" draggable={false} onClick={() => onSelect?.(i)} />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 px-1 py-0.5 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
              <button type="button" className="px-1 text-xs text-white disabled:opacity-30" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={t("Move earlier", "ඉදිරියට")}>◀</button>
              <button type="button" className="px-1 text-xs text-white" onClick={() => onChange(images.filter((_, k) => k !== i))} aria-label={t("Remove", "ඉවත් කරන්න")}>✕</button>
              <button type="button" className="px-1 text-xs text-white disabled:opacity-30" disabled={i === images.length - 1} onClick={() => move(i, i + 1)} aria-label={t("Move later", "පසුපසට")}>▶</button>
            </div>
          </li>
        ))}
        <li>
          <button type="button" className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-ink-300 text-ink-500 transition hover:border-maroon-500 hover:text-maroon-600" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            <span className="text-[11px] font-semibold">{t("Add photos", "එක් කරන්න")}</span>
          </button>
        </li>
      </ul>
      <input ref={input} type="file" accept="image/*" multiple className="sr-only" aria-label={t("Add gallery photos", "ගැලරි ඡායාරූප එක් කරන්න")} onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      <p className="hint">{t("Drag to reorder. Click a photo, then fine-tune it in this panel.", "අදින්න පිළිවෙළ මාරු කිරීමට. ඡායාරූපයක් ක්ලික් කර මෙහි සකසන්න.")}</p>
    </div>
  );
}
