import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { ApprovalGuard } from "@/components/ApprovalGuard";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen bg-cream-50">
      <AppHeader user={{ name: user.name, email: user.email, role: user.role }} />
      <main id="main" className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:pt-10"><ApprovalGuard>{children}</ApprovalGuard></main>
    </div>
  );
}
