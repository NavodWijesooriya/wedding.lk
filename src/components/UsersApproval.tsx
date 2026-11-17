"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, type Timestamp } from "firebase/firestore";
import { Check, Loader2, Search, ShieldCheck, Users, X } from "lucide-react";
import { db, firebaseConfigured } from "@/lib/firebase";
import { useAuth, type UserRole, type UserStatus } from "@/context/AuthContext";
import { useI18n } from "@/components/ui/i18n";
import { useToast } from "@/components/ui/toast";

type Row = { uid: string; email: string; fullName: string; role: UserRole; status: UserStatus; createdAt: Timestamp | null };
const TABS: UserStatus[] = ["pending", "approved", "rejected"];

export function UsersApproval() {
  const { t } = useI18n();
  const toast = useToast();
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<UserStatus>("pending");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseConfigured || !isAdmin) return;
    return onSnapshot(
      query(collection(db, "users"), orderBy("createdAt", "desc")),
      (snap) => { setRows(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<Row, "uid">) }))); setError(""); },
      () => setError(t("Couldn't load users. Check your Firestore Security Rules.", "පරිශීලකයන් පූරණය කළ නොහැකි විය. Firestore Security Rules පරීක්ෂා කරන්න.")),
    );
  }, [isAdmin, t]);

  const counts = useMemo(() => Object.fromEntries(TABS.map((s) => [s, rows?.filter((r) => r.status === s).length ?? 0])) as Record<UserStatus, number>, [rows]);
  const shown = (rows ?? []).filter((r) => r.status === tab && (!q || `${r.fullName} ${r.email}`.toLowerCase().includes(q.toLowerCase())));

  const setStatus = async (r: Row, status: UserStatus) => {
    if (!user) return;
    setBusy(r.uid);
    try {
      await updateDoc(doc(db, "users", r.uid), { status, reviewedBy: user.uid, reviewedAt: serverTimestamp() });
      toast("success", status === "approved" ? t(`${r.fullName || r.email} approved.`, `${r.fullName || r.email} අනුමත කළා.`) : t(`${r.fullName || r.email} rejected.`, `${r.fullName || r.email} ප්‍රතික්ෂේප කළා.`));
    } catch {
      toast("error", t("Couldn't update this user. Please try again.", "මෙම පරිශීලකයා යාවත්කාලීන කළ නොහැකි විය."));
    } finally { setBusy(null); }
  };

  const label = { pending: t("Pending", "බලාපොරොත්තුවෙන්"), approved: t("Approved", "අනුමත"), rejected: t("Rejected", "ප්‍රතික්ෂේප") };
  const chip = { pending: "bg-gold-300/30 text-gold-600", approved: "bg-sage-100 text-sage-600", rejected: "bg-red-50 text-red-700" };
  const fmt = (ts: Timestamp | null) => (ts ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Colombo" }).format(ts.toDate()) : "—");

  if (!isAdmin) return <p className="panel-card p-6 text-ink-700">{t("Only administrators can manage users.", "පරිශීලකයන් කළමනාකරණය කළ හැක්කේ පරිපාලකයන්ට පමණි.")}</p>;
  if (error) return <p role="alert" className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-ink-200 bg-white p-0.5" role="tablist" aria-label="User status">
          {TABS.map((s) => (
            <button key={s} role="tab" aria-selected={tab === s} onClick={() => setTab(s)} className={`inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1.5 text-sm font-semibold ${tab === s ? "bg-maroon-600 text-white" : "text-ink-700 hover:bg-ink-900/5"}`}>
              {label[s]}<span className={`rounded-full px-1.5 text-xs tabular-nums ${tab === s ? "bg-white/25" : "bg-ink-200"}`} data-testid={`count-${s}`}>{counts[s]}</span>
            </button>
          ))}
        </div>
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input className="input !w-64 !pl-9" placeholder={t("Search name or email", "නම හෝ ඊමේල් සොයන්න")} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t("Search users", "පරිශීලකයන් සොයන්න")} />
        </label>
      </div>

      {rows === null ? (
        <div className="space-y-2" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16" />)}</div>
      ) : shown.length === 0 ? (
        <div className="panel-card flex flex-col items-center gap-2 px-6 py-14 text-center"><Users className="size-9 text-ink-300" /><p className="font-display text-2xl font-bold">{t(`No ${label[tab].toLowerCase()} users`, `${label[tab]} පරිශීලකයන් නැත`)}</p></div>
      ) : (
        <ul className="panel-card divide-y divide-ink-200/70 overflow-hidden" aria-label="Users">
          {shown.map((r) => {
            const self = r.uid === user?.uid;
            const locked = self || r.role === "admin";
            return (
              <li key={r.uid} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4" data-testid={`user-${r.email}`}>
                <div className="min-w-0 flex-1 basis-56">
                  <p className="flex items-center gap-2 font-bold">{r.fullName || "—"}{r.role === "admin" && <span className="chip bg-maroon-100 text-maroon-700"><ShieldCheck className="size-3" />Admin</span>}</p>
                  <p className="truncate text-sm text-ink-500">{r.email}</p>
                  <p className="text-xs text-ink-400">{t("Joined", "එක්වූයේ")} {fmt(r.createdAt)}</p>
                </div>
                <span className={`chip ${chip[r.status]}`}>{label[r.status]}</span>
                <div className="flex gap-1.5">
                  {r.status !== "approved" && <button disabled={locked || busy === r.uid} onClick={() => setStatus(r, "approved")} className="btn-primary !min-h-9 !px-3">{busy === r.uid ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}{t("Approve", "අනුමත කරන්න")}</button>}
                  {r.status !== "rejected" && <button disabled={locked || busy === r.uid} onClick={() => setStatus(r, "rejected")} className="btn-secondary !min-h-9 !px-3 text-red-600"><X className="size-4" />{r.status === "approved" ? t("Revoke", "ඉවත් කරන්න") : t("Reject", "ප්‍රතික්ෂේප")}</button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
