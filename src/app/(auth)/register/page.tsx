import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { AuthForm } from "@/components/AuthForm";
import { getUser } from "@/lib/auth";
import { getT } from "@/lib/lang";

export const metadata = { title: "Create account" };
export default async function Page() {
  if (await getUser()) redirect("/dashboard");
  const { t } = await getT();
  return <AuthShell title={t("Start your wedding website", "ඔබේ විවාහ වෙබ් අඩවිය ආරම්භ කරන්න")} sub={t("Free to start. No design skills needed.", "නොමිලේ ආරම්භ කරන්න. නිර්මාණ දැනුමක් අවශ්‍ය නැත.")}><AuthForm mode="register" /></AuthShell>;
}
