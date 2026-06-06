"use client";

import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/ui/Toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { fetchSettings, saveSettings } from "@/lib/db";
import { SEED_SETTINGS } from "@/lib/seed";
import type { SiteSettings } from "@/types";

const TEXT_FIELDS: [keyof SiteSettings, string, boolean][] = [
  ["storeName", "Store name", false],
  ["tagline", "Tagline", false],
  ["announcement", "Announcement bar", false],
  ["supportEmail", "Support email", false],
  ["supportPhone", "Support phone", false],
  ["supportWhatsapp", "WhatsApp", false],
  ["bkashNumber", "bKash number (Send Money)", false],
  ["paymentInstructions", "Payment instructions", true],
  ["footerNote", "Footer note", true],
  ["featuredKicker", "Featured · kicker", false],
  ["featuredTitle", "Featured · title", false],
  ["featuredCopy", "Featured · copy", true],
  ["categoriesKicker", "Categories · kicker", false],
  ["categoriesTitle", "Categories · title", false],
  ["categoriesCopy", "Categories · copy", true],
  ["newsletterTitle", "Newsletter · title", false],
  ["newsletterCopy", "Newsletter · copy", true],
  ["aboutTitle", "About · title", false],
  ["aboutBody", "About · body", true],
  ["contactTitle", "Contact · title", false],
  ["contactBody", "Contact · body", true],
  ["policiesTitle", "Policies · title", false],
  ["policiesBody", "Policies · body", true],
];

const NUM_FIELDS: [keyof SiteSettings, string][] = [
  ["shippingDhaka", "Shipping (Dhaka)"],
  ["shippingOther", "Shipping (other)"],
  ["lowStockThreshold", "Low stock threshold"],
];

export default function CmsPanel() {
  const { toast } = useToast();
  const [s, setS] = useState<SiteSettings>(SEED_SETTINGS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured) fetchSettings().then((d) => setS({ ...SEED_SETTINGS, ...d }));
  }, []);

  const set = (k: keyof SiteSettings, v: any) => setS((p) => ({ ...p, [k]: v }));
  const setHero = (k: string, v: any) =>
    setS((p) => ({ ...p, heroBanner: { ...p.heroBanner, [k]: v } }));

  const save = async () => {
    if (!isFirebaseConfigured) return toast("Configure Firebase first", "error");
    setBusy(true);
    try {
      await saveSettings(s);
      toast("CMS saved — live across the site", "success");
    } catch (err: any) {
      toast(err?.message || "Save failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="serif-title text-2xl">Website CMS</h2>
          <p className="text-muted text-sm">Edit all site text — changes reflect instantly via Firestore.</p>
        </div>
        <button onClick={save} disabled={busy} className="btn disabled:opacity-60">
          {busy ? "Saving…" : "Save all changes"}
        </button>
      </div>

      {/* Hero */}
      <div className="card p-5 grid gap-4">
        <h3 className="font-bold">Hero section</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">Eyebrow</label><input className="input" value={s.heroBanner.eyebrow} onChange={(e) => setHero("eyebrow", e.target.value)} /></div>
          <div><label className="label">Title</label><input className="input" value={s.heroBanner.title} onChange={(e) => setHero("title", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="label">Copy</label><textarea className="input min-h-[60px]" value={s.heroBanner.copy} onChange={(e) => setHero("copy", e.target.value)} /></div>
          <div><label className="label">Primary button label</label><input className="input" value={s.heroBanner.primaryLabel} onChange={(e) => setHero("primaryLabel", e.target.value)} /></div>
          <div><label className="label">Primary button link</label><input className="input" value={s.heroBanner.primaryLink} onChange={(e) => setHero("primaryLink", e.target.value)} /></div>
          <div><label className="label">Secondary button label</label><input className="input" value={s.heroBanner.secondaryLabel} onChange={(e) => setHero("secondaryLabel", e.target.value)} /></div>
          <div><label className="label">Secondary button link</label><input className="input" value={s.heroBanner.secondaryLink} onChange={(e) => setHero("secondaryLink", e.target.value)} /></div>
          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
            <ImageUploader bucket="hero" label="Hero background (16:9)" aspect="aspect-video" value={s.heroBanner.image} onChange={(url) => setHero("image", url)} />
            <ImageUploader bucket="hero" label="Hero product image" value={s.heroBanner.productImage} onChange={(url) => setHero("productImage", url)} />
          </div>
        </div>
      </div>

      {/* Numbers */}
      <div className="card p-5 grid gap-3">
        <h3 className="font-bold">Store settings</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {NUM_FIELDS.map(([k, label]) => (
            <div key={k}>
              <label className="label">{label}</label>
              <input className="input" type="number" value={s[k] as number} onChange={(e) => set(k, Number(e.target.value))} />
            </div>
          ))}
        </div>
      </div>

      {/* Text fields */}
      <div className="card p-5 grid gap-4">
        <h3 className="font-bold">Text content</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {TEXT_FIELDS.map(([k, label, multi]) => (
            <div key={k} className={multi ? "sm:col-span-2" : ""}>
              <label className="label">{label}</label>
              {multi ? (
                <textarea className="input min-h-[70px]" value={s[k] as string} onChange={(e) => set(k, e.target.value)} />
              ) : (
                <input className="input" value={s[k] as string} onChange={(e) => set(k, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={busy} className="btn w-fit disabled:opacity-60">
        {busy ? "Saving…" : "Save all changes"}
      </button>
    </div>
  );
}
