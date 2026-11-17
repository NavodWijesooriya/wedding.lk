import { AuthShell } from "@/components/AuthShell";
import { ApprovalGuard } from "@/components/ApprovalGuard";
import { FirebaseAuthForm } from "@/components/FirebaseAuthForm";
import { getT } from "@/lib/lang";

export const metadata = { title: "Sign in" };
export default async function Page() {
  const { t } = await getT();
  return (
    <ApprovalGuard allowAnonymous redirectApprovedTo="/dashboard">
      <AuthShell title={t("Welcome back", "නැවත සාදරයෙන් පිළිගනිමු")} sub={t("Sign in to continue building your invitation.", "ඔබේ ආරාධනය දිගටම සකස් කිරීමට පිවිසෙන්න.")}><FirebaseAuthForm mode="login" /></AuthShell>
    </ApprovalGuard>
  );
}
