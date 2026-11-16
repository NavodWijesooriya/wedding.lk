import Link from "next/link";
import { Lotus } from "@/components/site/ornaments";
import { getT } from "@/lib/lang";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream-50 px-6 text-center">
      <Lotus className="h-14 w-20 text-gold-500" />
      <h1 className="font-display text-5xl font-bold">{t("We couldn't find that page", "එම පිටුව සොයාගත නොහැක")}</h1>
      <p className="max-w-md text-ink-700">{t("The invitation may not be published yet, or the link may have changed.", "ආරාධනය තවම ප්‍රකාශිත නොවිය හැක, නැතහොත් ලින්ක් එක වෙනස් වී ඇත.")}</p>
      <Link href="/" className="btn-primary btn-lg">{t("Go home", "මුල් පිටුවට")}</Link>
    </main>
  );
}
