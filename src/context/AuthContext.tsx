"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, type User,
} from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc, type Timestamp } from "firebase/firestore";
import { auth, db, firebaseConfigured, googleProvider } from "@/lib/firebase";

export type UserRole = "user" | "admin";
export type UserStatus = "pending" | "approved" | "rejected";
export type UserProfile = { uid: string; email: string; fullName: string; role: UserRole; status: UserStatus; createdAt: Timestamp | null };

type AuthCtx = {
  configured: boolean;
  user: User | null;
  profile: UserProfile | null;
  /** True until Firebase has resolved the signed-in user *and* their Firestore profile. */
  loading: boolean;
  /** True once the server session cookie has been issued for an approved user / admin. */
  sessionReady: boolean;
  /** approved users and admins may use the dashboard and builder */
  allowed: boolean;
  signUpWithEmail: (fullName: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
const SESSION_REFRESH_MS = 25 * 60_000; // server sessions last 1h; renew well before expiry

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authResolved, setAuthResolved] = useState(!firebaseConfigured);
  const [profileResolved, setProfileResolved] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const pendingName = useRef<string | null>(null);
  const creating = useRef<string | null>(null);

  // 1. Firebase auth state
  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setProfile(null);
      setSessionReady(false);
      setProfileResolved(!u);
      setAuthResolved(true);
      if (!u) fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    });
  }, []);

  // 2. Live profile document; create it the first time we see a new account (email or Google)
  useEffect(() => {
    if (!firebaseConfigured || !user) return;
    const ref = doc(db, "users", user.uid);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setProfile({ uid: user.uid, email: d.email ?? user.email ?? "", fullName: d.fullName ?? "", role: d.role === "admin" ? "admin" : "user", status: d.status ?? "pending", createdAt: d.createdAt ?? null });
          setProfileResolved(true);
        } else if (creating.current !== user.uid) {
          creating.current = user.uid;
          const fullName = pendingName.current || user.displayName || (user.email ?? "").split("@")[0] || "Guest";
          pendingName.current = null;
          setDoc(ref, { uid: user.uid, email: user.email ?? "", fullName, role: "user", status: "pending", createdAt: serverTimestamp() }).catch(() => {
            creating.current = null;
            setProfileResolved(true);
          });
        }
      },
      () => setProfileResolved(true),
    );
  }, [user]);

  const allowed = !!profile && (profile.role === "admin" || profile.status === "approved");

  // 3. Bridge to the server session — only while the account is allowed; revoke immediately otherwise
  useEffect(() => {
    if (!firebaseConfigured || !user || !profile) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const sync = async (force: boolean) => {
      try {
        const res = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await user.getIdToken(force) }) });
        if (cancelled) return;
        setSessionReady(res.ok);
        if (res.ok) timer = setTimeout(() => sync(true), SESSION_REFRESH_MS);
      } catch {
        if (!cancelled) setSessionReady(false);
      }
    };
    if (allowed) sync(false);
    else {
      setSessionReady(false);
      fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    }
    return () => { cancelled = true; clearTimeout(timer); };
  }, [user, profile, allowed]);

  const signUpWithEmail = useCallback(async (fullName: string, email: string, password: string) => {
    pendingName.current = fullName.trim();
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: fullName.trim() });
  }, []);
  const signInWithEmail = useCallback(async (email: string, password: string) => { await signInWithEmailAndPassword(auth, email.trim(), password); }, []);
  const signInWithGoogle = useCallback(async () => { await signInWithPopup(auth, googleProvider); }, []);
  const logout = useCallback(async () => {
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    if (firebaseConfigured) await signOut(auth);
    setSessionReady(false);
    router.replace("/login");
    router.refresh();
  }, [router]);

  const value = useMemo<AuthCtx>(() => ({
    configured: firebaseConfigured, user, profile, loading: !authResolved || !profileResolved || (!!user && !profile), sessionReady, allowed,
    signUpWithEmail, signInWithEmail, signInWithGoogle, logout,
  }), [user, profile, authResolved, profileResolved, sessionReady, allowed, signUpWithEmail, signInWithEmail, signInWithGoogle, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside <AuthProvider>");
  return c;
}

