import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { AuthForm } from "@/components/AuthForm";
import { getUser } from "@/lib/auth";
import { getT } from "@/lib/lang";

export const metadata = { title: "Sign in" };
export default async function Page() {
  if (await getUser()) redirect("/dashboard");
  const { t } = await getT();
  return <AuthShell title={t("Welcome back", "නැවත සාදරයෙන් පිළිගනිමු")} sub={t("Sign in to continue building your invitation.", "ඔබේ ආරාධනය දිගටම සකස් කිරීමට පිවිසෙන්න.")}><AuthForm mode="login" /></AuthShell>;
}
