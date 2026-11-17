"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, registerSchema } from "@/lib/validation";
import { useI18n } from "@/components/ui/i18n";

type Values = { name?: string; email: string; password: string };

const GoogleG = () => (
  <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.2 5.6c4.3-3.9 6.8-9.7 6.8-17.1z" />
    <path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7.9-6.2A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.2z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.2-5.6c-2 1.4-4.9 2.3-8.7 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

export function FirebaseAuthForm({ mode }: { mode: "login" | "signup" }) {
  const { t } = useI18n();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [google, setGoogle] = useState(false);
  const signup = mode === "signup";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver((signup ? registerSchema : loginSchema) as any) });

  const explain = (e: unknown) => {
    const code = e instanceof FirebaseError ? e.code : "";
    const m: Record<string, string> = {
      "auth/invalid-credential": t("Incorrect email or password.", "ඊමේල් හෝ මුරපදය වැරදියි."),
      "auth/wrong-password": t("Incorrect email or password.", "ඊමේල් හෝ මුරපදය වැරදියි."),
      "auth/user-not-found": t("Incorrect email or password.", "ඊමේල් හෝ මුරපදය වැරදියි."),
      "auth/email-already-in-use": t("An account with this email already exists. Try signing in.", "මෙම ඊමේල් ලිපිනයෙන් ගිණුමක් දැනටමත් ඇත. පිවිසීමට උත්සාහ කරන්න."),
      "auth/weak-password": t("Choose a stronger password (at least 8 characters).", "වඩා ශක්තිමත් මුරපදයක් තෝරන්න (අවම අක්ෂර 8)."),
      "auth/too-many-requests": t("Too many attempts. Please wait a few minutes.", "උත්සාහ ගණන වැඩියි. මිනිත්තු කිහිපයකින් නැවත උත්සාහ කරන්න."),
      "auth/network-request-failed": t("Network problem. Check your connection and try again.", "ජාල දෝෂයකි. සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න."),
      "auth/popup-blocked": t("Your browser blocked the Google pop-up. Allow pop-ups and try again.", "ඔබේ බ්‍රවුසරය Google කවුළුව අවහිර කළා. ඉඩ දී නැවත උත්සාහ කරන්න."),
      "auth/account-exists-with-different-credential": t("This email is already registered with a different sign-in method.", "මෙම ඊමේල් එක වෙනත් පිවිසුම් ක්‍රමයකින් ලියාපදිංචි වී ඇත."),
    };
    return m[code] ?? t("Something went wrong. Please try again.", "යම් දෝෂයක් සිදු විය. නැවත උත්සාහ කරන්න.");
  };

  const onSubmit = async (v: Values) => {
    setError("");
    try {
      if (signup) await signUpWithEmail(v.name!, v.email, v.password);
      else await signInWithEmail(v.email, v.password);
    } catch (e) { setError(explain(e)); }
  };
  const onGoogle = async () => {
    setError(""); setGoogle(true);
    try { await signInWithGoogle(); }
    catch (e) { if (!(e instanceof FirebaseError && (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request"))) setError(explain(e)); }
    finally { setGoogle(false); }
  };

  return (
    <div className="space-y-5">
      <button type="button" onClick={onGoogle} disabled={google || isSubmitting} className="btn-secondary btn-lg w-full">
        {google ? <Loader2 className="size-4 animate-spin" /> : <GoogleG />}
        {signup ? t("Sign up with Google", "Google මගින් ලියාපදිංචි වන්න") : t("Continue with Google", "Google මගින් පිවිසෙන්න")}
      </button>
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-ink-400"><span className="h-px flex-1 bg-ink-200" />{t("or", "හෝ")}<span className="h-px flex-1 bg-ink-200" /></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {signup && (
          <div>
            <label className="label" htmlFor="name">{t("Full name", "සම්පූර්ණ නම")}</label>
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
          <input id="password" type="password" className="input" autoComplete={signup ? "new-password" : "current-password"} {...register("password")} aria-invalid={!!errors.password} />
          {errors.password && <p className="err">{signup ? t("Use at least 8 characters.", "අවම වශයෙන් අක්ෂර 8ක් භාවිතා කරන්න.") : t("Enter your password.", "මුරපදය ඇතුළත් කරන්න.")}</p>}
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}
        <button className="btn-primary btn-lg w-full" disabled={isSubmitting || google}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {signup ? t("Create my account", "මගේ ගිණුම සාදන්න") : t("Sign in", "පිවිසෙන්න")}
        </button>
      </form>
      {signup && <p className="text-center text-xs text-ink-500">{t("New accounts are reviewed by our team before the builder unlocks.", "සාදනය විවෘත වීමට පෙර නව ගිණුම් අපගේ කණ්ඩායම විසින් සමාලෝචනය කරයි.")}</p>}
      <p className="text-center text-sm text-ink-500">
        {signup ? <>{t("Already have an account?", "දැනටමත් ගිණුමක් තිබේද?")} <Link href="/login" className="font-semibold text-maroon-600 hover:underline">{t("Sign in", "පිවිසෙන්න")}</Link></>
          : <>{t("New here?", "අලුත්ද?")} <Link href="/signup" className="font-semibold text-maroon-600 hover:underline">{t("Create a free account", "නොමිලේ ගිණුමක් සාදන්න")}</Link></>}
      </p>
    </div>
  );
}
