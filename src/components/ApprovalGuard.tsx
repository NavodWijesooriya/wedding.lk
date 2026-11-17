"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Loader2, LogOut, ShieldAlert, TriangleAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/components/ui/i18n";
import { Brand } from "@/components/ui/Brand";
import { Lotus } from "@/components/site/ornaments";

function Shell({ icon, title, children, tone = "gold" }: { icon: ReactNode; title: string; children: ReactNode; tone?: "gold" | "red" }) {
  return (
    <main id="main" className="flex min-h-[70vh] flex-col items-center justify-center bg-cream-50 px-5 py-16 text-center">
      <div className="mb-8"><Brand /></div>
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-ink-200/70 bg-white px-8 py-12 shadow-lift">
        <Lotus className="pointer-events-none absolute -right-8 -top-6 w-40 text-gold-300 opacity-30" />
        <span className={`relative mx-auto flex size-16 items-center justify-center rounded-full ${tone === "red" ? "bg-red-50 text-red-600" : "bg-gold-300/30 text-gold-600"}`}>{icon}</span>
        <h1 className="relative mt-6 font-display text-4xl font-bold leading-tight">{title}</h1>
        <div className="relative mt-3 space-y-3 text-ink-700">{children}</div>
      </div>
    </main>
  );
}

function SignOutButton() {
  const { logout } = useAuth();
  const { t } = useI18n();
  return <button onClick={() => logout()} className="btn-secondary btn-lg relative mt-8"><LogOut className="size-4" />{t("Sign out", "පිටවන්න")}</button>;
}

export function PendingApproval() {
  const { profile, user } = useAuth();
  const { t } = useI18n();
  return (
    <Shell icon={<Clock3 className="size-8" />} title={t("Account pending approval", "ගිණුම අනුමැතිය බලාපොරොත්තුවෙන්")}>
      <p>{t("Thank you for joining Wedding.lk. An administrator needs to approve your account before you can build your invitation.", "Wedding.lk හා එක්වීමට ස්තූතියි. ඔබේ ආරාධනය සැකසීමට පෙර පරිපාලකයෙකු ඔබේ ගිණුම අනුමත කළ යුතුය.")}</p>
      <p className="rounded-xl bg-cream-100 px-4 py-2.5 text-sm font-semibold">{profile?.email || user?.email}</p>
      <p className="text-sm text-ink-500">{t("This page updates automatically the moment you are approved — no need to refresh.", "ඔබ අනුමත වූ සැණින් මෙම පිටුව ස්වයංක්‍රීයව යාවත්කාලීන වේ.")}</p>
      <SignOutButton />
    </Shell>
  );
}

export function AccessDenied() {
  const { t } = useI18n();
  return (
    <Shell tone="red" icon={<ShieldAlert className="size-8" />} title={t("Access denied", "ප්‍රවේශය ප්‍රතික්ෂේප විය")}>
      <p>{t("Your account was not approved, so you can't use the dashboard or website builder.", "ඔබේ ගිණුම අනුමත නොවූ බැවින් උපකරණ පුවරුව හෝ වෙබ් අඩවි සාදනය භාවිතා කළ නොහැක.")}</p>
      <p className="text-sm text-ink-500">{t("If you think this is a mistake, please contact the Wedding.lk team.", "මෙය වැරදීමක් යැයි සිතන්නේ නම් කරුණාකර Wedding.lk කණ්ඩායම අමතන්න.")}</p>
      <SignOutButton />
    </Shell>
  );
}

function ConfigMissing() {
  return (
    <Shell tone="red" icon={<TriangleAlert className="size-8" />} title="Firebase isn't configured">
      <p>Add the <code className="rounded bg-cream-100 px-1.5 py-0.5 text-sm">NEXT_PUBLIC_FIREBASE_*</code> variables to <code className="rounded bg-cream-100 px-1.5 py-0.5 text-sm">.env.local</code> and restart the server. See the README.</p>
    </Shell>
  );
}

export function FullScreenLoader({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink-500" role="status">
      <Loader2 className="size-7 animate-spin text-maroon-600" />
      <p className="text-sm font-semibold">{label ?? t("Loading…", "පූරණය වෙමින්…")}</p>
    </div>
  );
}

/**
 * Gate for the dashboard / builder (and for the auth pages with `allowAnonymous`).
 *  - signed out         → /login (or the children when `allowAnonymous`)
 *  - status pending     → "Account pending approval" screen
 *  - status rejected    → "Access denied" screen
 *  - approved or admin  → children (once the server session is ready)
 * Reacts in real time: approving, rejecting or revoking someone updates their open tab immediately.
 */
export function ApprovalGuard({ children, allowAnonymous = false, redirectApprovedTo }: { children: ReactNode; allowAnonymous?: boolean; redirectApprovedTo?: string }) {
  const { configured, user, profile, loading, allowed, sessionReady } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const goLogin = configured && !loading && !user && !allowAnonymous;
  const goApproved = !!(redirectApprovedTo && allowed && sessionReady);
  const target = profile?.role === "admin" ? "/admin" : redirectApprovedTo;

  useEffect(() => { if (goLogin) router.replace("/login"); }, [goLogin, router]);
  useEffect(() => { if (goApproved && target) { router.replace(target); router.refresh(); } }, [goApproved, target, router]);

  if (!configured) return <ConfigMissing />;
  if (loading) return <FullScreenLoader />;
  if (!user || !profile) return allowAnonymous ? <>{children}</> : <FullScreenLoader />;
  if (!allowed) return profile.status === "rejected" ? <AccessDenied /> : <PendingApproval />;
  if (!sessionReady || goApproved) return <FullScreenLoader label={t("Signing you in…", "ඔබව පිවිසෙමින්…")} />;
  return <>{children}</>;
}
