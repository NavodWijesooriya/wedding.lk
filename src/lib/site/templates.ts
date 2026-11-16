import type { Theme } from "./types";

export type TemplateDef = {
  id: string;
  name: { en: string; si: string };
  desc: { en: string; si: string };
  theme: Theme;
  tags: string[];
};

const base = { animation: "rise", border: "thin", radius: "soft" } as const;

export const TEMPLATES: TemplateDef[] = [
  {
    id: "kandyan",
    name: { en: "Traditional Kandyan", si: "සම්ප්‍රදායික උඩරට" },
    desc: { en: "Deep maroon and antique gold, framed with Kandyan motifs.", si: "උඩරට සැරසිලි සහිත ගැඹුරු රතු සහ රන්වන් වර්ණ." },
    tags: ["Traditional", "Gold"],
    theme: { ...base, primary: "#7A1F2B", secondary: "#B8893B", bg: "#FAF1E1", text: "#3B1F1A", button: "#7A1F2B", headingFont: "cormorant", bodyFont: "lato", ornament: "kandyan", heroLayout: "center", border: "double" },
  },
  {
    id: "luxury",
    name: { en: "Modern Luxury", si: "නවීන සුඛෝපභෝගී" },
    desc: { en: "Editorial serif type, warm stone and champagne accents.", si: "සරල, අලංකාර අකුරු සහ ෂැම්පේන් වර්ණ." },
    tags: ["Modern", "Elegant"],
    theme: { ...base, primary: "#1F1B16", secondary: "#B08D57", bg: "#FBFAF7", text: "#2B2620", button: "#1F1B16", headingFont: "playfair", bodyFont: "jost", ornament: "none", heroLayout: "split", radius: "sharp" },
  },
  {
    id: "minimal",
    name: { en: "Minimalist White", si: "සරල සුදු" },
    desc: { en: "Pure white space, quiet typography, nothing extra.", si: "පිරිසිදු සුදු අවකාශය සහ නිහඬ අකුරු." },
    tags: ["Minimal"],
    theme: { ...base, primary: "#222222", secondary: "#8C8C8C", bg: "#FFFFFF", text: "#2A2A2A", button: "#222222", headingFont: "jost", bodyFont: "jost", ornament: "none", heroLayout: "center", radius: "sharp", animation: "fade" },
  },
  {
    id: "floral",
    name: { en: "Elegant Floral", si: "මල් සැරසිලි" },
    desc: { en: "Soft rose and sage with a romantic script heading.", si: "රෝස සහ කොළ වර්ණ, ආදරණීය අත් අකුරු." },
    tags: ["Romantic", "Floral"],
    theme: { ...base, primary: "#B94A63", secondary: "#6E8B6A", bg: "#FFF8F5", text: "#4A2C32", button: "#B94A63", headingFont: "script", bodyFont: "lato", ornament: "floral", heroLayout: "arch", radius: "round" },
  },
  {
    id: "lotus",
    name: { en: "Lotus Traditional", si: "නෙළුම් සම්ප්‍රදායික" },
    desc: { en: "Lotus-pink palette with graceful serif lettering.", si: "නෙළුම් රෝස වර්ණ සහ අලංකාර අකුරු." },
    tags: ["Traditional", "Lotus"],
    theme: { ...base, primary: "#A8326A", secondary: "#D79B3C", bg: "#FEF3F6", text: "#40202E", button: "#A8326A", headingFont: "cormorant", bodyFont: "lato", ornament: "lotus", heroLayout: "arch", radius: "round" },
  },
  {
    id: "royal",
    name: { en: "Royal Gold", si: "රාජකීය රන්වන්" },
    desc: { en: "Regal gold on warm cream with engraved capitals.", si: "රාජකීය රන්වන් වර්ණ සහ කැටයම් අකුරු." },
    tags: ["Luxury", "Gold"],
    theme: { ...base, primary: "#8A6516", secondary: "#D4AF37", bg: "#FFF9E8", text: "#33280F", button: "#8A6516", headingFont: "cinzel", bodyFont: "cormorant", ornament: "kandyan", heroLayout: "full", border: "double", radius: "sharp" },
  },
  {
    id: "pink",
    name: { en: "Modern Pink", si: "නවීන රෝස" },
    desc: { en: "Fresh blush and berry, friendly and contemporary.", si: "නවීන රෝස සහ බෙරි වර්ණ." },
    tags: ["Modern", "Playful"],
    theme: { ...base, primary: "#D63A74", secondary: "#F7A8C3", bg: "#FFF1F5", text: "#3F1B2B", button: "#D63A74", headingFont: "dmserif", bodyFont: "manrope", ornament: "none", heroLayout: "split", radius: "round", border: "none" },
  },
  {
    id: "cultural",
    name: { en: "Sinhala Cultural", si: "සිංහල සංස්කෘතික" },
    desc: { en: "Temple saffron and maroon, set in Sinhala-first typography.", si: "කහ සහ රතු වර්ණ, සිංහල අකුරු සඳහා සුදුසුයි." },
    tags: ["Cultural", "Sinhala"],
    theme: { ...base, primary: "#B5500F", secondary: "#7A1F2B", bg: "#FFF5E3", text: "#3A2212", button: "#B5500F", headingFont: "abhaya", bodyFont: "notosanssi", ornament: "kandyan", heroLayout: "center", border: "double" },
  },
  {
    id: "garden",
    name: { en: "Garden Wedding", si: "උද්‍යාන මංගල්‍යය" },
    desc: { en: "Botanical greens with a touch of gold, full-bleed photo cover.", si: "ශාක කොළ වර්ණ සහ රන්වන් ස්පර්ශයක්." },
    tags: ["Outdoor", "Green"],
    theme: { ...base, primary: "#3F6B4B", secondary: "#C0973F", bg: "#F6F8F1", text: "#22301F", button: "#3F6B4B", headingFont: "playfair", bodyFont: "lato", ornament: "floral", heroLayout: "full" },
  },
  {
    id: "dark",
    name: { en: "Luxury Dark", si: "සුඛෝපභෝගී අඳුරු" },
    desc: { en: "Midnight canvas with champagne gold — evening glamour.", si: "රාත්‍රී අඳුරු පසුබිම සහ රන්වන් වර්ණ." },
    tags: ["Dark", "Evening"],
    theme: { ...base, primary: "#D8B56D", secondary: "#8C6A3A", bg: "#141115", text: "#F1E8D8", button: "#D8B56D", headingFont: "cormorant", bodyFont: "jost", ornament: "lotus", heroLayout: "center", animation: "fade" },
  },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

export type Palette = { id: string; name: { en: string; si: string }; primary: string; secondary: string; bg: string; text: string; button: string };

export const PALETTES: Palette[] = [
  { id: "maroon-gold", name: { en: "Maroon & Gold", si: "රතු සහ රන්" }, primary: "#7A1F2B", secondary: "#B8893B", bg: "#FAF1E1", text: "#3B1F1A", button: "#7A1F2B" },
  { id: "lotus-blush", name: { en: "Lotus Blush", si: "නෙළුම් රෝස" }, primary: "#A8326A", secondary: "#D79B3C", bg: "#FEF3F6", text: "#40202E", button: "#A8326A" },
  { id: "sage-ivory", name: { en: "Sage & Ivory", si: "කොළ සහ ඇඳු" }, primary: "#4F6F52", secondary: "#C0973F", bg: "#F7F5EC", text: "#26301F", button: "#4F6F52" },
  { id: "navy-gold", name: { en: "Navy & Gold", si: "නිල් සහ රන්" }, primary: "#1E2A4A", secondary: "#C9A24B", bg: "#FBF8F1", text: "#1B2038", button: "#1E2A4A" },
  { id: "saffron", name: { en: "Temple Saffron", si: "කහ සහ රතු" }, primary: "#B5500F", secondary: "#7A1F2B", bg: "#FFF5E3", text: "#3A2212", button: "#B5500F" },
  { id: "peacock", name: { en: "Peacock Teal", si: "මොනර නිල්" }, primary: "#0F6B6F", secondary: "#D79B3C", bg: "#F2F8F6", text: "#112B2D", button: "#0F6B6F" },
  { id: "midnight-rose", name: { en: "Midnight Rose", si: "මධ්‍යම රාත්‍රී රෝස" }, primary: "#E3B6C0", secondary: "#B98A5A", bg: "#17121A", text: "#F4E9EC", button: "#E3B6C0" },
  { id: "cinnamon", name: { en: "Cinnamon Cream", si: "කුරුඳු" }, primary: "#8B4A2B", secondary: "#C99A5B", bg: "#FBF4EA", text: "#3A2417", button: "#8B4A2B" },
];
