"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, PenLine, ShieldCheck, LogOut } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { LangSwitch, useI18n } from "@/components/ui/i18n";
import { useAuth } from "@/context/AuthContext";

export function AppHeader({ user }: { user: { name: string; email: string; role: string } }) {
  const { t } = useI18n();
  const { logout } = useAuth();
  const path = usePathname();
  const nav = [
    { href: "/dashboard", label: t("Dashboard", "උපකරණ පුවරුව"), icon: LayoutDashboard, match: (p: string) => p === "/dashboard" },
    { href: "/dashboard/guests", label: t("Guests", "අමුත්තන්"), icon: Users, match: (p: string) => p.startsWith("/dashboard/guests") },
    { href: "/editor", label: t("Edit website", "වෙබ් අඩවිය සංස්කරණය"), icon: PenLine, match: () => false },
    ...(user.role === "admin" ? [{ href: "/admin", label: t("Admin", "පරිපාලක"), icon: ShieldCheck, match: (p: string) => p.startsWith("/admin") }] : []),
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-cream-50/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Brand href="/dashboard" />
        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={n.match(path) ? "page" : undefined} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${n.match(path) ? "bg-maroon-600/10 text-maroon-700" : "text-ink-700 hover:bg-ink-900/5"}`}>
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LangSwitch className="hidden sm:inline-flex" />
          <span className="hidden text-sm text-ink-500 lg:inline">{user.name}</span>
          <button className="btn-ghost" onClick={() => logout()} aria-label={t("Sign out", "පිටවන්න")}><LogOut className="size-4" /><span className="hidden sm:inline">{t("Sign out", "පිටවන්න")}</span></button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-ink-200/60 px-3 py-1.5 md:hidden" aria-label="Main mobile">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${n.match(path) ? "bg-maroon-600/10 text-maroon-700" : "text-ink-700"}`}><n.icon className="size-4" />{n.label}</Link>
        ))}
        <LangSwitch className="ml-auto shrink-0 sm:hidden" />
      </nav>
    </header>
  );
}
