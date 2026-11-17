"use client";
import { useState, type ReactNode } from "react";
import { Globe, Users } from "lucide-react";
import { UsersApproval } from "@/components/UsersApproval";
import { useI18n } from "@/components/ui/i18n";

/** Admin console: user approvals (Firestore, real-time) and website reviews (server data passed in as children). */
export function AdminTabs({ websites }: { websites: ReactNode }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"users" | "websites">("users");
  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-ink-200" role="tablist">
        {([["users", Users, t("User approvals", "පරිශීලක අනුමැතිය")], ["websites", Globe, t("Website reviews", "වෙබ් අඩවි සමාලෝචනය")]] as const).map(([k, I, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${tab === k ? "border-maroon-600 text-maroon-700" : "border-transparent text-ink-500 hover:text-ink-900"}`}><I className="size-4" />{l}</button>
        ))}
      </div>
      {tab === "users" ? <UsersApproval /> : websites}
    </div>
  );
}
