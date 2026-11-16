import type { Theme } from "@/lib/site/types";

/** Stylised lotus — drawn with layered petals so it reads at any size. */
export function Lotus({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  const petal = "M60 10 C47 30 47 54 60 68 C73 54 73 30 60 10Z";
  return (
    <svg viewBox="0 0 120 80" className={className} style={style} fill="none" aria-hidden="true">
      {[-72, 72].map((a) => (
        <path key={a} d={petal} transform={`rotate(${a} 60 70)`} fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="1.2" />
      ))}
      {[-42, 42].map((a) => (
        <path key={a} d={petal} transform={`rotate(${a} 60 70)`} fill="currentColor" opacity=".32" stroke="currentColor" strokeWidth="1.2" />
      ))}
      <path d={petal} fill="currentColor" opacity=".55" stroke="currentColor" strokeWidth="1.4" />
      <path d="M60 24 C56 38 56 52 60 62 C64 52 64 38 60 24Z" fill="currentColor" opacity=".25" />
      <path d="M30 72 C44 78 76 78 90 72" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Flower({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.9} rx={r * 0.55} ry={r * 0.95} transform={`rotate(${a})`} fill="currentColor" opacity=".35" stroke="currentColor" strokeWidth="1" />
      ))}
      <circle r={r * 0.32} fill="currentColor" />
    </g>
  );
}

export function FloralSprig({ className = "", style, flip }: { className?: string; style?: React.CSSProperties; flip?: boolean }) {
  return (
    <svg viewBox="0 0 160 70" className={className} style={{ ...style, transform: flip ? "scaleX(-1)" : undefined }} fill="none" aria-hidden="true">
      <path d="M4 52 C40 52 60 30 100 34 S140 40 156 28" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {[28, 52, 78, 112].map((x, i) => (
        <ellipse key={x} cx={x} cy={i % 2 ? 44 : 58} rx="9" ry="3.6" transform={`rotate(${i % 2 ? -35 : 30} ${x} ${i % 2 ? 44 : 58})`} fill="currentColor" opacity=".4" stroke="currentColor" strokeWidth=".8" />
      ))}
      <Flower cx={96} cy={30} r={9} />
      <Flower cx={140} cy={30} r={6} />
      <Flower cx={58} cy={46} r={5} />
    </svg>
  );
}

/** Ornamental divider that follows the template's decorative style. */
export function Divider({ ornament, className = "" }: { ornament: Theme["ornament"]; className?: string }) {
  if (ornament === "lotus")
    return (
      <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
        <span className="h-px w-16 bg-current opacity-40 @md:w-28" />
        <Lotus className="h-9 w-14" style={{ color: "var(--secondary)" }} />
        <span className="h-px w-16 bg-current opacity-40 @md:w-28" />
      </div>
    );
  if (ornament === "floral")
    return (
      <div className={`flex items-center justify-center gap-1 ${className}`} aria-hidden="true">
        <FloralSprig className="h-9 w-24 @md:w-32" style={{ color: "var(--secondary)" }} flip />
        <FloralSprig className="h-9 w-24 @md:w-32" style={{ color: "var(--secondary)" }} />
      </div>
    );
  if (ornament === "kandyan")
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
        <span className="h-px w-14 opacity-50 @md:w-24" style={{ background: "var(--secondary)" }} />
        <svg viewBox="0 0 60 24" className="h-6 w-14" fill="none" style={{ color: "var(--secondary)" }}>
          <path d="M30 2 L38 12 L30 22 L22 12Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity=".25" />
          <path d="M2 12 H18 M42 12 H58" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="30" cy="12" r="2.2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="48" cy="12" r="2" fill="currentColor" />
        </svg>
        <span className="h-px w-14 opacity-50 @md:w-24" style={{ background: "var(--secondary)" }} />
      </div>
    );
  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <span className="h-px w-16" style={{ background: "var(--secondary)" }} />
    </div>
  );
}

/** Repeating Kandyan-style scroll band used on framed templates. */
export function KandyanBand({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="20" aria-hidden="true" style={{ color: "var(--secondary)" }}>
      <defs>
        <pattern id="kband" width="40" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10 Q10 -2 20 10 T40 10" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <circle cx="20" cy="14" r="1.8" fill="currentColor" />
          <path d="M10 4 l2 3 -2 3 -2 -3z" fill="currentColor" opacity=".6" />
        </pattern>
      </defs>
      <rect width="100%" height="20" fill="url(#kband)" />
    </svg>
  );
}

/** Soft illustrated placeholder shown wherever no photo has been uploaded. */
export function Placeholder({ kind = "scene", className = "" }: { kind?: "couple" | "scene" | "person"; className?: string }) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: "linear-gradient(160deg, color-mix(in srgb, var(--primary) 22%, var(--bg)) 0%, color-mix(in srgb, var(--secondary) 28%, var(--bg)) 100%)" }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full opacity-[.16]" style={{ color: "var(--primary)" }}>
        <defs>
          <pattern id={`pp-${kind}`} width="44" height="44" patternUnits="userSpaceOnUse">
            <circle cx="22" cy="22" r="2.2" fill="currentColor" />
            <path d="M22 4 L26 14 L22 10 L18 14Z M22 40 L26 30 L22 34 L18 30Z M4 22 L14 18 L10 22 L14 26Z M40 22 L30 18 L34 22 L30 26Z" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pp-${kind})`} />
      </svg>
      <Lotus className="relative w-[46%] max-w-40" style={{ color: "var(--primary)", opacity: 0.75 }} />
    </div>
  );
}
