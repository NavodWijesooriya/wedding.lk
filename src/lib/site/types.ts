export type Lang = "en" | "si";
export type L10n = { en: string; si: string };

export type ImageShape = "rect" | "rounded" | "arch" | "circle" | "oval";
export type ImageRef = {
  src: string; // media URL, e.g. /media/abc123.webp
  x: number; // object-position x in %
  y: number; // object-position y in %
  zoom: number; // 1 – 3
  shape?: ImageShape;
} | null;

export type SectionType =
  | "hero" | "couple" | "story" | "message" | "countdown" | "datetime" | "venue" | "map"
  | "schedule" | "details" | "parents" | "gallery" | "rsvp" | "wishes" | "contact" | "footer";

export type SectionStyle = {
  bg?: string;
  bgImage?: ImageRef;
  overlay?: number; // 0-80 darkness over bg image
  color?: string;
  padY?: "sm" | "md" | "lg";
  align?: "left" | "center" | "right";
};

export type Section = {
  id: string;
  type: SectionType;
  visible: boolean;
  props: Record<string, any>;
  style: SectionStyle;
};

export type ElementStyle = {
  size?: number; // percent scale of default size, 60–220
  font?: string;
  color?: string;
  bg?: string;
  align?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
};

export type Theme = {
  primary: string;
  secondary: string;
  bg: string;
  text: string;
  button: string;
  headingFont: string;
  bodyFont: string;
  radius: "sharp" | "soft" | "round";
  border: "none" | "thin" | "double";
  ornament: "lotus" | "floral" | "kandyan" | "none";
  animation: "none" | "fade" | "rise";
  heroLayout: "center" | "split" | "arch" | "full";
};

export type Info = {
  bride: L10n;
  groom: L10n;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  venueName: L10n;
  venueAddress: L10n;
  receptionName: L10n;
  receptionAddress: L10n;
  receptionTime: string;
  brideParents: L10n;
  groomParents: L10n;
  message: L10n;
  story: L10n;
  phone: string;
  whatsapp: string;
  email: string;
  mapUrl: string;
};

export type Doc = {
  v: 1;
  template: string;
  lang: Lang; // default display language of the website
  title: string;
  info: Info;
  theme: Theme;
  sections: Section[];
  styles: Record<string, ElementStyle>;
};

export type Wish = { id: string; name: string; message: string; created_at: number };
