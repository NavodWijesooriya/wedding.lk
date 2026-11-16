"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { loginAction, registerAction } from "@/app/actions/auth";
import { loginSchema, registerSchema } from "@/lib/validation";
import { useI18n } from "@/components/ui/i18n";

type Values = { name?: string; email: string; password: string };

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState("");
  const reg = mode === "register";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver((reg ? registerSchema : loginSchema) as any) });

  const msg: Record<string, string> = {
    email_taken: t("An account with this email already exists. Try signing in.", "මෙම ඊමේල් ලිපිනයෙන් ගිණුමක් දැනටමත් ඇත. පිවිසීමට උත්සාහ කරන්න."),
    bad_credentials: t("Incorrect email or password.", "ඊමේල් හෝ මුරපදය වැරදියි."),
    rate_limited: t("Too many attempts. Please wait a few minutes.", "උත්සාහ ගණන වැඩියි. මිනිත්තු කිහිපයකින් නැවත උත්සාහ කරන්න."),
    invalid: t("Please check your details.", "කරුණාකර ඔබගේ විස්තර පරීක්ෂා කරන්න."),
  };

  const onSubmit = async (v: Values) => {
    setError("");
    const r = reg ? await registerAction(v) : await loginAction(v);
    if (!r.ok) return setError(msg[r.code] ?? msg.invalid);
    router.push(!reg && (r as any).role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {reg && (
        <div>
          <label className="label" htmlFor="name">{t("Your name", "ඔබගේ නම")}</label>
          <input id="name" className="input" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="err">{t("Please enter your name.", "කරුණාකර ඔබගේ නම ඇතුළත් කරන්න.")}</p>}
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">{t("Email", "ඊමේල්")}</label>
        <input id="email" type="email" className="input" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <p className="err">{t("Enter a valid email address.", "වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.")}</p>}
      </div>
      <div>
        <label className="label" htmlFor="password">{t("Password", "මුරපදය")}</label>
        <input id="password" type="password" className="input" autoComplete={reg ? "new-password" : "current-password"} {...register("password")} aria-invalid={!!errors.password} />
        {errors.password && <p className="err">{reg ? t("Use at least 8 characters.", "අවම වශයෙන් අක්ෂර 8ක් භාවිතා කරන්න.") : t("Enter your password.", "මුරපදය ඇතුළත් කරන්න.")}</p>}
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}
      <button className="btn-primary btn-lg w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {reg ? t("Create my account", "මගේ ගිණුම සාදන්න") : t("Sign in", "පිවිසෙන්න")}
      </button>
      <p className="text-center text-sm text-ink-500">
        {reg ? <>{t("Already have an account?", "දැනටමත් ගිණුමක් තිබේද?")} <Link href="/login" className="font-semibold text-maroon-600 hover:underline">{t("Sign in", "පිවිසෙන්න")}</Link></>
          : <>{t("New here?", "අලුත්ද?")} <Link href="/register" className="font-semibold text-maroon-600 hover:underline">{t("Create a free account", "නොමිලේ ගිණුමක් සාදන්න")}</Link></>}
      </p>
    </form>
  );
}
