import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicWedding, listWishes } from "@/lib/weddings";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { formatDate, tr } from "@/lib/site/util";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

const names = (d: any) => `${tr(d.info.bride, d.lang) || "Bride"} & ${tr(d.info.groom, d.lang) || "Groom"}`;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const w = getPublicWedding((await params).slug);
  if (!w) return { title: "Invitation not found", robots: { index: false } };
  const d = w.publishedDoc!;
  const hero = d.sections.find((s) => s.type === "hero");
  const img = hero?.props.image?.src || hero?.style.bgImage?.src || d.sections.find((s) => s.type === "gallery")?.props.images?.[0]?.src;
  const title = `${names(d)} — ${d.lang === "si" ? "විවාහ ආරාධනය" : "Wedding Invitation"}`;
  const desc = [formatDate(d.info.date, d.lang), tr(d.info.venueName, d.lang)].filter(Boolean).join(" · ") || tr(d.info.message, d.lang).slice(0, 150);
  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: `/w/${w.slug}` },
    openGraph: { title, description: desc, type: "website", images: img ? [{ url: img }] : undefined },
    twitter: { card: img ? "summary_large_image" : "summary", title, description: desc },
  };
}

export default async function Page({ params }: Params) {
  const w = getPublicWedding((await params).slug);
  if (!w) notFound();
  const d = w.publishedDoc!;
  const wishes = listWishes(w.id);
  const ld = {
    "@context": "https://schema.org", "@type": "Event", name: `${names(d)} Wedding`,
    startDate: d.info.date ? `${d.info.date}${d.info.time ? `T${d.info.time}` : ""}` : undefined,
    location: tr(d.info.venueName, "en") ? { "@type": "Place", name: tr(d.info.venueName, "en"), address: tr(d.info.venueAddress, "en") } : undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <main id="main"><SiteRenderer doc={d} wishes={wishes} slug={w.slug} live animate showLangSwitch /></main>
    </>
  );
}
