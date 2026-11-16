import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getWeddingByUser, listRsvps, rsvpStats } from "@/lib/weddings";
import { GuestsTable } from "@/components/GuestsTable";
import { getT } from "@/lib/lang";

export const metadata = { title: "Guests & RSVPs" };

export default async function Page() {
  const user = await requireUser();
  const w = getWeddingByUser(user.id);
  if (!w) redirect("/create");
  const { t } = await getT();
  return (
    <div>
      <Link href="/dashboard" className="btn-ghost -ml-3 mb-2"><ArrowLeft className="size-4" />{t("Dashboard", "උපකරණ පුවරුව")}</Link>
      <h1 className="mb-6 font-display text-4xl font-bold sm:text-5xl">{t("Guests & RSVPs", "අමුත්තන් සහ RSVP")}</h1>
      <GuestsTable rows={listRsvps(w.id)} stats={rsvpStats(w.id)} />
    </div>
  );
}
