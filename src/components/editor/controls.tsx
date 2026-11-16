"use client";
import { useEffect, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { useI18n } from "@/components/ui/i18n";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function Group({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border-b border-ink-200/70 px-4 py-4 last:border-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-[.14em] text-ink-500">{title}</h3>
        {action}
      </div>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export function ColorField({ label, value, onChange, onClear, swatches = [] }: { label: string; value?: string; onChange: (v: string) => void; onClear?: () => void; swatches?: string[] }) {
  const { t } = useI18n();
  const [txt, setTxt] = useState(value ?? "");
  useEffect(() => setTxt(value ?? ""), [value]);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink-700">{label}</span>
        {onClear && value && <button type="button" className="text-xs font-semibold text-ink-500 hover:text-maroon-600" onClick={onClear}>{t("Reset", "යළි සකසන්න")}</button>}
      </div>
      <div className="flex items-center gap-2">
        <label className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-ink-200 shadow-sm" style={{ background: value || "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 50% / 10px 10px" }}>
          <input type="color" aria-label={label} className="absolute inset-0 size-full cursor-pointer opacity-0" value={value && HEX.test(value) ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} />
        </label>
        <input className="input !py-1.5 font-mono text-sm uppercase" maxLength={7} value={txt} placeholder="#RRGGBB" aria-label={`${label} hex`} onChange={(e) => { setTxt(e.target.value); if (HEX.test(e.target.value)) onChange(e.target.value.toLowerCase()); }} />
      </div>
      {swatches.length > 0 && (
        <div className="mt-2 flex gap-1.5">
          {swatches.map((c, i) => <button key={i} type="button" aria-label={c} title={c} onClick={() => onChange(c)} className="size-6 rounded-full border border-black/10 transition hover:scale-110" style={{ background: c }} />)}
        </div>
      )}
    </div>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, suffix = "" }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[13px] font-semibold text-ink-700"><span>{label}</span><span className="tabular-nums text-ink-500">{Math.round(value * 100) / 100}{suffix}</span></div>
      <input type="range" className="w-full accent-maroon-600" aria-label={label} min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T | undefined; options: { v: T; label: ReactNode; title?: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="flex rounded-xl border border-ink-200 bg-cream-50 p-0.5" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.v} type="button" title={o.title} aria-label={o.title} aria-pressed={value === o.v} onClick={() => onChange(o.v)} className={`flex min-h-8 flex-1 items-center justify-center rounded-[10px] px-2 text-[13px] font-semibold transition ${value === o.v ? "bg-white text-maroon-700 shadow-sm" : "text-ink-500 hover:text-ink-900"}`}>{o.label}</button>
      ))}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-[13px] font-semibold text-ink-700">
      {label}
      <input type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span aria-hidden="true" className="relative h-6 w-10 shrink-0 rounded-full bg-ink-300 transition peer-checked:bg-maroon-600 peer-focus-visible:ring-2 peer-focus-visible:ring-editor after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" />
    </label>
  );
}

export const ResetBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-maroon-600"><RotateCcw className="size-3" />{label}</button>
);
