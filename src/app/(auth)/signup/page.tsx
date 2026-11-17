import { AuthShell } from "@/components/AuthShell";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { FirebaseAuthForm } from "@/components/FirebaseAuthForm";
import { getT } from "@/lib/lang";

export const metadata = { title: "Create account" };
export default async function Page() {
  const { t } = await getT();
  return (
    <ApprovalGuard allowAnonymous redirectApprovedTo="/dashboard">
      <AuthShell title={t("Start your wedding website", "ඔබේ විවාහ වෙබ් අඩවිය ආරම්භ කරන්න")} sub={t("Free to start. No design skills needed.", "නොමිලේ ආරම්භ කරන්න. නිර්මාණ දැනුමක් අවශ්‍ය නැත.")}><FirebaseAuthForm mode="signup" /></AuthShell>
    </ApprovalGuard>
  );
}
