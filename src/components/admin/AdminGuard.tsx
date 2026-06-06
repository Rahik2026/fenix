"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { isValidEmail } from "@/lib/utils";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, configured, signIn, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted">
        Loading admin…
      </div>
    );
  }

  // Logged in admin
  if (user && isAdmin) return <>{children}</>;

  // Logged in but not admin
  if (user && !isAdmin) {
    return (
      <Centered>
        <h1 className="serif-title text-2xl mb-2">Access denied</h1>
        <p className="text-muted mb-5 text-sm">
          {user.email} is not authorized for the admin panel.
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={() => signOut()} className="btn-ghost">Sign out</button>
          <Link href="/" className="btn">Go home</Link>
        </div>
      </Centered>
    );
  }

  // Not logged in -> admin login
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) return toast("Add Firebase keys to .env.local (SETUP.md)", "error");
    if (!isValidEmail(email)) return toast("Enter a valid email", "error");
    setBusy(true);
    try {
      await signIn(email, password);
      toast("Welcome back, admin", "success");
      router.refresh();
    } catch (err: any) {
      toast(err?.message?.replace("Firebase:", "").trim() || "Login failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Centered>
      <span className="kicker">Admin</span>
      <h1 className="serif-title text-3xl mb-1">FENIX Control Panel</h1>
      <p className="text-muted text-sm mb-6">Authorized administrators only.</p>
      {!configured && (
        <div className="mb-4 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-[#7a5a10] text-left">
          Admin login requires Firebase keys in <code>.env.local</code>. See SETUP.md.
        </div>
      )}
      <form onSubmit={submit} className="grid gap-4 text-left">
        <div>
          <label className="label">Admin email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@fenix.store" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button type="submit" disabled={busy} className="btn disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <Link href="/" className="block mt-4 text-sm text-muted hover:text-ink">← Back to store</Link>
    </Centered>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-b from-[#0a2337] to-[#0e2e3d]">
      <div className="w-full max-w-md card p-7 text-center">{children}</div>
    </div>
  );
}
