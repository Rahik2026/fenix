"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { isValidEmail } from "@/lib/utils";

export default function AuthView() {
  const { signIn, signUp, configured, user, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="serif-title text-3xl mb-3">You are signed in</h1>
        <p className="text-muted mb-6">{user.email}</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => router.push("/account")} className="btn">My account</button>
          {isAdmin && <button onClick={() => router.push("/admin")} className="btn-ghost">Admin panel</button>}
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      toast("Firebase not configured — add keys to .env.local", "error");
      return;
    }
    if (!isValidEmail(email)) return toast("Enter a valid email", "error");
    if (password.length < 6) return toast("Password must be 6+ characters", "error");
    if (mode === "register" && name.trim().length < 2)
      return toast("Enter your name", "error");
    setBusy(true);
    try {
      if (mode === "login") await signIn(email, password);
      else await signUp(name.trim(), email, password);
      toast("Welcome to FENIX", "success");
      router.push("/account");
    } catch (err: any) {
      toast(err?.message?.replace("Firebase:", "").trim() || "Auth failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x py-12 md:py-16">
      <div className="max-w-md mx-auto card p-6 md:p-8">
        <div className="flex rounded-xl bg-[#f1f5fa] p-1 mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-colors ${
                mode === m ? "bg-white shadow-sm text-primary" : "text-muted"
              }`}
            >
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        {!configured && (
          <div className="mb-4 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-[#7a5a10]">
            Auth requires Firebase keys in <code>.env.local</code> (see SETUP.md).
          </div>
        )}

        <form onSubmit={submit} className="grid gap-4">
          {mode === "register" && (
            <div>
              <label className="label">Full name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </div>
          <button type="submit" disabled={busy} className="btn mt-1 disabled:opacity-60">
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
