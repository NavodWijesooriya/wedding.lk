export type FontDef = { key: string; label: string; stack: string; google: string; kind: "heading" | "body" | "both"; si: boolean };

const SI = "'Abhaya Libre','Noto Serif Sinhala'";
const SI_SANS = "'Noto Sans Sinhala'";

export const FONTS: FontDef[] = [
  { key: "cormorant", label: "Cormorant Garamond", stack: `'Cormorant Garamond',${SI},serif`, google: "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500", kind: "both", si: true },
  { key: "playfair", label: "Playfair Display", stack: `'Playfair Display',${SI},serif`, google: "Playfair+Display:ital,wght@0,400;0,500;0,700;1,400", kind: "heading", si: true },
  { key: "cinzel", label: "Cinzel", stack: `'Cinzel',${SI},serif`, google: "Cinzel:wght@400;500;600;700", kind: "heading", si: true },
  { key: "dmserif", label: "DM Serif Display", stack: `'DM Serif Display',${SI},serif`, google: "DM+Serif+Display:ital@0;1", kind: "heading", si: true },
  { key: "script", label: "Great Vibes (script)", stack: `'Great Vibes','Pinyon Script',${SI},cursive`, google: "Great+Vibes", kind: "heading", si: true },
  { key: "abhaya", label: "Abhaya Libre (Sinhala)", stack: `'Abhaya Libre','Noto Serif Sinhala',serif`, google: "Abhaya+Libre:wght@400;500;600;700", kind: "both", si: true },
  { key: "notoserifsi", label: "Noto Serif Sinhala", stack: `'Noto Serif Sinhala','Abhaya Libre',serif`, google: "Noto+Serif+Sinhala:wght@400;500;600;700", kind: "both", si: true },
  { key: "jost", label: "Jost", stack: `'Jost',${SI_SANS},sans-serif`, google: "Jost:wght@300;400;500;600", kind: "both", si: true },
  { key: "lato", label: "Lato", stack: `'Lato',${SI_SANS},sans-serif`, google: "Lato:wght@300;400;700", kind: "body", si: true },
  { key: "manrope", label: "Manrope", stack: `'Manrope',${SI_SANS},sans-serif`, google: "Manrope:wght@400;500;600;700", kind: "body", si: true },
  { key: "notosanssi", label: "Noto Sans Sinhala", stack: `'Noto Sans Sinhala','Manrope',sans-serif`, google: "Noto+Sans+Sinhala:wght@300;400;500;600;700", kind: "body", si: true },
];

const byKey = new Map(FONTS.map((f) => [f.key, f]));
export const fontStack = (key: string | undefined, fallback = "cormorant") => (byKey.get(key || "") ?? byKey.get(fallback)!).stack;

export function fontsUrl(keys: string[]) {
  const fams = [...new Set(keys)].map((k) => byKey.get(k)?.google).filter(Boolean);
  if (!fams.length) return "";
  return `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f}`).join("&")}&display=swap`;
}
