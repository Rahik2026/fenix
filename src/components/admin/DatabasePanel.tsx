"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { isSupabaseConfigured, ensureBuckets, clearAllBuckets } from "@/lib/supabase";
import { initializeDatabase, resetDatabase } from "@/lib/db";

export default function DatabasePanel() {
  const { toast } = useToast();
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const init = async () => {
    if (!isFirebaseConfigured) return toast("Configure Firebase first (SETUP.md)", "error");
    setBusy(true);
    setLog([]);
    const out: string[] = [];
    try {
      out.push("→ Initializing Firestore collections…");
      const dbLog = await initializeDatabase();
      out.push(...dbLog);
      if (isSupabaseConfigured) {
        out.push("→ Ensuring Supabase storage buckets…");
        const created = await ensureBuckets();
        out.push(
          created.length
            ? `buckets: created ${created.join(", ")}`
            : "buckets: products / hero / banners already exist"
        );
      } else {
        out.push("buckets: Supabase not configured (skipped)");
      }
      out.push("✓ Done.");
      toast("Database initialized", "success");
    } catch (err: any) {
      out.push(`✗ Error: ${err?.message || err}`);
      toast("Initialization failed", "error");
    } finally {
      setLog(out);
      setBusy(false);
    }
  };

  const reset = async () => {
    if (confirmText !== "RESET") return toast("Type RESET to confirm", "error");
    setBusy(true);
    setLog([]);
    const out: string[] = [];
    try {
      out.push("→ Deleting all Firestore collections…");
      const dbLog = await resetDatabase();
      out.push(...dbLog);
      if (isSupabaseConfigured) {
        out.push("→ Clearing Supabase storage…");
        await clearAllBuckets();
        out.push("buckets: cleared all files");
      }
      out.push("✓ Reset complete.");
      toast("Database reset", "success");
    } catch (err: any) {
      out.push(`✗ Error: ${err?.message || err}`);
      toast("Reset failed", "error");
    } finally {
      setLog(out);
      setBusy(false);
      setConfirm(false);
      setConfirmText("");
    }
  };

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="serif-title text-2xl mb-1">Database management</h2>
        <p className="text-muted text-sm">
          Initialize seeds the 8 Firestore collections and Supabase buckets. Reset wipes everything.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 grid gap-3">
          <h3 className="font-bold">1 · Initialize Database</h3>
          <p className="text-sm text-muted">
            Creates collections (products, orders, users, payments, settings, categories, coupons, admin),
            adds default seed data if empty, and connects Supabase buckets.
          </p>
          <button onClick={init} disabled={busy} className="btn w-fit disabled:opacity-60">
            {busy ? "Working…" : "Initialize Database"}
          </button>
        </div>

        <div className="card p-5 grid gap-3 border-danger/30">
          <h3 className="font-bold text-danger">2 · Reset Database</h3>
          <p className="text-sm text-muted">
            Deletes all Firestore collections and clears Supabase storage. This cannot be undone.
          </p>
          {!confirm ? (
            <button onClick={() => setConfirm(true)} className="btn-ghost w-fit border-danger text-danger">
              Reset Database…
            </button>
          ) : (
            <div className="grid gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3">
              <p className="text-sm font-bold text-danger">Type RESET to confirm permanent deletion:</p>
              <input className="input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="RESET" />
              <div className="flex gap-2">
                <button onClick={reset} disabled={busy || confirmText !== "RESET"} className="btn disabled:opacity-50" style={{ background: "linear-gradient(180deg,#d45c5c,#a53d3d)" }}>
                  {busy ? "Resetting…" : "Confirm reset"}
                </button>
                <button onClick={() => { setConfirm(false); setConfirmText(""); }} className="btn-ghost">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {log.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-sm mb-2">Output log</h3>
          <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-muted">
            {log.join("\n")}
          </pre>
        </div>
      )}
    </div>
  );
}
