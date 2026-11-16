import type { Doc, Info, L10n, Section, SectionType, Theme } from "./types";
import { getTemplate } from "./templates";
import { uid } from "./util";

const L = (en: string, si = ""): L10n => ({ en, si });

export type SectionMeta = {
  type: SectionType;
  label: L10n;
  desc: L10n;
  icon: string; // lucide icon name, resolved in UI
  single?: boolean; // only one allowed
};

export const SECTION_META: SectionMeta[] = [
  { type: "hero", label: L("Cover", "මුල් පිටුව"), desc: L("Names, date and a welcoming first impression", "නම්, දිනය සහ පළමු ඉදිරිපත් කිරීම"), icon: "Sparkles", single: true },
  { type: "couple", label: L("Couple Introduction", "යුවළ හඳුන්වාදීම"), desc: L("A short, warm introduction", "කෙටි උණුසුම් හැඳින්වීමක්"), icon: "Heart" },
  { type: "story", label: L("Our Love Story", "අපගේ ආදර කතාව"), desc: L("Tell how you met", "ඔබ හමුවූ ආකාරය"), icon: "BookHeart" },
  { type: "message", label: L("Invitation Message", "ආරාධනා පණිවිඩය"), desc: L("Your formal invitation words", "ඔබේ ආරාධනා වචන"), icon: "Mail" },
  { type: "countdown", label: L("Countdown", "ගණන් කිරීම"), desc: L("Live countdown to the big day", "විවාහ දිනයට ඉතිරි කාලය"), icon: "Timer" },
  { type: "datetime", label: L("Date & Time", "දිනය සහ වේලාව"), desc: L("When the celebrations happen", "උත්සව පවත්වන වේලාව"), icon: "CalendarDays" },
  { type: "venue", label: L("Venue", "ස්ථානය"), desc: L("Wedding and reception venues", "විවාහ සහ සත්කාර ස්ථාන"), icon: "MapPin" },
  { type: "map", label: L("Google Maps", "Google සිතියම"), desc: L("Embedded map with directions", "සිතියම සහ මාර්ග උපදෙස්"), icon: "Map" },
  { type: "schedule", label: L("Schedule", "කාලසටහන"), desc: L("Timeline of the wedding day", "විවාහ දිනයේ කාලසටහන"), icon: "ListChecks" },
  { type: "details", label: L("Bride & Groom", "මනාලිය සහ මනාලයා"), desc: L("Photo cards for each of you", "ඔබ දෙදෙනාගේ ඡායාරූප කාඩ්පත්"), icon: "Users" },
  { type: "parents", label: L("Parents", "දෙමාපියන්"), desc: L("Both families, honoured", "දෙපාර්ශවයේ පවුල්"), icon: "HeartHandshake", single: true },
  { type: "gallery", label: L("Gallery", "ගැලරිය"), desc: L("Photos of the two of you", "ඔබ දෙදෙනාගේ ඡායාරූප"), icon: "Images" },
  { type: "rsvp", label: L("RSVP", "පැමිණීම තහවුරු කිරීම"), desc: L("Collect guest responses", "අමුත්තන්ගේ පිළිතුරු"), icon: "MailCheck", single: true },
  { type: "wishes", label: L("Guest Wishes", "සුබ පැතුම්"), desc: L("Messages left by guests", "අමුත්තන්ගේ පණිවිඩ"), icon: "MessageCircleHeart", single: true },
  { type: "contact", label: L("Contact", "සම්බන්ධ වන්න"), desc: L("Phone, WhatsApp and email", "දුරකථන, WhatsApp සහ ඊමේල්"), icon: "Phone", single: true },
  { type: "footer", label: L("Footer", "පාදය"), desc: L("A closing blessing", "අවසන් ආශීර්වාදය"), icon: "PanelBottom", single: true },
];

export const metaOf = (t: SectionType) => SECTION_META.find((m) => m.type === t)!;

export function defaultProps(type: SectionType): Record<string, any> {
  switch (type) {
    case "hero":
      return { tagline: L("Together with their families", "ඔවුන්ගේ පවුල් සමඟ එක්ව"), cta: L("Join our celebration", "අපගේ උත්සවයට එක්වන්න"), ctaHref: "#rsvp", image: null, showCta: true };
    case "couple":
      return { title: L("Two hearts, one journey", "හදවත් දෙකක්, ගමනක් එකයි"), text: L("Two families, one beautiful beginning. We cannot wait to share it with you.", "පවුල් දෙකක්, සුන්දර ආරම්භයක්. එය ඔබ සමඟ බෙදා ගැනීමට අපි බලා සිටිමු."), image: null };
    case "story":
      return { title: L("Our Love Story", "අපගේ ආදර කතාව"), image: null };
    case "message":
      return { title: L("With joy, we invite you", "ඔබට ප්‍රීතියෙන් ආරාධනා කරමු") };
    case "countdown":
      return { title: L("Counting down to our day", "අපගේ දිනයට තව") };
    case "datetime":
      return { title: L("Save the date", "දිනය සටහන් කර ගන්න") };
    case "venue":
      return { title: L("The Venue", "උත්සව ස්ථානය"), image: null, weddingLabel: L("Wedding Ceremony", "විවාහ මංගල්‍යය"), receptionLabel: L("Reception", "මංගල සත්කාරය") };
    case "map":
      return { title: L("Find us", "අපව සොයා ගන්න"), button: L("Open in Google Maps", "Google Maps හි විවෘත කරන්න"), query: "" };
    case "schedule":
      return {
        title: L("Wedding Day Schedule", "විවාහ දින කාලසටහන"),
        items: [
          { id: uid(), time: "09:00", title: L("Guests arrive", "ආගන්තුකයන් පැමිණීම"), desc: L("Welcome drinks and seating", "පිළිගැනීම සහ අසුන් ගැනීම") },
          { id: uid(), time: "09:45", title: L("Poruwa ceremony", "පෝරු චාරිත්‍රය"), desc: L("The traditional wedding rituals", "සම්ප්‍රදායික විවාහ චාරිත්‍ර") },
          { id: uid(), time: "12:00", title: L("Wedding lunch", "මංගල දිවා භෝජනය"), desc: L("Join us for a celebratory meal", "සමරු භෝජනයට එක්වන්න") },
          { id: uid(), time: "18:30", title: L("Reception & dancing", "සත්කාරය සහ නැටුම්"), desc: L("An evening of music and joy", "සංගීතය සහ ප්‍රීතිය පිරි සවස") },
        ],
      };
    case "details":
      return {
        title: L("Meet the Bride & Groom", "මනාලිය සහ මනාලයා"),
        brideRole: L("The Bride", "මනාලිය"), groomRole: L("The Groom", "මනාලයා"),
        brideBio: L("", ""), groomBio: L("", ""), brideImage: null, groomImage: null,
      };
    case "parents":
      return { title: L("Our Families", "අපගේ පවුල්"), brideLabel: L("Daughter of", "දියණිය"), groomLabel: L("Son of", "පුත්‍රයා") };
    case "gallery":
      return { title: L("Our Moments", "අපගේ මතක"), images: [], layout: "grid", shape: "rounded" };
    case "rsvp":
      return { title: L("Will you join us?", "ඔබ අප සමඟ එක්වේද?"), subtitle: L("Kindly let us know if you can make it.", "කරුණාකර ඔබට පැමිණිය හැකිදැයි දැනුම් දෙන්න."), deadline: "", askGuests: true, maxGuests: 6, whatsapp: true, button: L("Send RSVP", "යවන්න") };
    case "wishes":
      return { title: L("Guest Wishes", "ආශීර්වාද සහ සුබ පැතුම්"), emptyText: L("Be the first to leave a blessing.", "පළමු සුබ පැතුම ඔබෙන් වේවා.") };
    case "contact":
      return { title: L("Get in touch", "අප අමතන්න"), subtitle: L("We'd love to hear from you.", "ඔබෙන් අසන්නට අපි කැමතියි.") };
    case "footer":
      return { text: L("With love and blessings", "ආදරයෙන් සහ ආශීර්වාදයෙන්"), hashtag: "" };
  }
}

export function newSection(type: SectionType): Section {
  return { id: `${type}-${uid()}`, type, visible: true, props: defaultProps(type), style: {} };
}

export const DEFAULT_ORDER: SectionType[] = ["hero", "message", "countdown", "datetime", "venue", "map", "schedule", "parents", "gallery", "rsvp", "wishes", "contact", "footer"];

export const DEFAULT_MESSAGE: L10n = {
  en: "Together with our families, we joyfully invite you to celebrate our wedding. Your presence and blessings will make our day truly complete.",
  si: "අපගේ පවුල් සමඟ එක්ව, අපගේ විවාහ මංගල්‍යය සමරන්නට ඔබට ප්‍රීතියෙන් ආරාධනා කරමු. ඔබගේ පැමිණීම සහ ආශීර්වාදය අපගේ දවස සම්පූර්ණ කරනු ඇත.",
};

export const emptyInfo = (): Info => ({
  bride: L("", ""), groom: L("", ""), date: "", time: "", venueName: L("", ""), venueAddress: L("", ""),
  receptionName: L("", ""), receptionAddress: L("", ""), receptionTime: "", brideParents: L("", ""), groomParents: L("", ""),
  message: { ...DEFAULT_MESSAGE }, story: L("", ""), phone: "", whatsapp: "", email: "", mapUrl: "",
});

export function buildDoc(info: Info, templateId: string, lang: "en" | "si" = "en"): Doc {
  const tpl = getTemplate(templateId);
  const sections = DEFAULT_ORDER.map(newSection);
  // Sections that should only appear once the user has content for them.
  const hide = (t: SectionType, cond: boolean) => { const s = sections.find((x) => x.type === t); if (s && cond) s.visible = false; };
  hide("parents", !info.brideParents.en && !info.brideParents.si && !info.groomParents.en && !info.groomParents.si);
  hide("contact", !info.phone && !info.email && !info.whatsapp);
  hide("map", !info.venueAddress.en && !info.venueAddress.si && !info.mapUrl);
  hide("gallery", false);
  if (info.story.en || info.story.si) {
    const at = sections.findIndex((s) => s.type === "message");
    sections.splice(at + 1, 0, newSection("story"));
  }
  return { v: 1, template: tpl.id, lang, title: "", info, theme: { ...tpl.theme }, sections, styles: {} };
}

export function applyTemplate(doc: Doc, templateId: string): Doc {
  const tpl = getTemplate(templateId);
  const keepAnim = doc.theme.animation;
  return { ...doc, template: tpl.id, theme: { ...tpl.theme, animation: keepAnim }, styles: {}, sections: doc.sections.map((s) => ({ ...s, style: { ...s.style, bg: undefined, color: undefined } })) };
}

export const themeOf = (d: Doc): Theme => d.theme;

/** A fully-populated demo used for template previews only (never saved). */
export function demoDoc(templateId: string, lang: "en" | "si" = "en"): Doc {
  const info: Info = {
    bride: L("Sanduni", "සඳුනි"), groom: L("Kavindu", "කවීන්දු"), date: nextSaturday(), time: "09:45",
    venueName: L("Mount Lavinia Hotel", "මවුන්ට් ලැවීනියා හෝටලය"), venueAddress: L("Hotel Rd, Mount Lavinia", "හෝටල් පාර, ගල්කිස්ස"),
    receptionName: L("The Grand Ballroom", "ග්‍රෑන්ඩ් ශාලාව"), receptionAddress: L("Hotel Rd, Mount Lavinia", "හෝටල් පාර, ගල්කිස්ස"), receptionTime: "18:30",
    brideParents: L("Mr. & Mrs. Perera", "ශ්‍රීමත් සහ ශ්‍රීමතී පෙරේරා"), groomParents: L("Mr. & Mrs. Fernando", "ශ්‍රීමත් සහ ශ්‍රීමතී ප්‍රනාන්දු"),
    message: { ...DEFAULT_MESSAGE }, story: L("We met on a rainy afternoon in Colombo and never stopped talking.", "කොළඹ වැසි සහිත සවසක අපි මුණගැසුණු අතර කතා කිරීම නැවැත්වූයේ නැත."),
    phone: "+94 77 123 4567", whatsapp: "+94771234567", email: "hello@example.com", mapUrl: "",
  };
  const d = buildDoc(info, templateId, lang);
  d.sections.forEach((s) => (s.visible = true));
  return d;
}

function nextSaturday(): string {
  const d = new Date(Date.UTC(2027, 0, 1));
  d.setUTCDate(d.getUTCDate() + ((6 - d.getUTCDay() + 7) % 7) + 7 * 4);
  return d.toISOString().slice(0, 10);
}
