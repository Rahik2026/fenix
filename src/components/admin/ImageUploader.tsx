"use client";

import { useState } from "react";
import SmartImage from "@/components/ui/SmartImage";
import { uploadImage, isSupabaseConfigured, type STORAGE_BUCKETS } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

export default function ImageUploader({
  bucket,
  value,
  onChange,
  label = "Image",
  aspect = "aspect-square",
}: {
  bucket: keyof typeof STORAGE_BUCKETS;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: string;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    if (!isSupabaseConfigured) {
      toast("Supabase not configured — paste an image URL instead", "error");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast("Image must be under 3MB (free-tier limit)", "error");
      return;
    }
    setBusy(true);
    try {
      const url = await uploadImage(bucket, file, bucket);
      onChange(url);
      toast("Image uploaded", "success");
    } catch (err: any) {
      toast(err?.message || "Upload failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-2">
      <span className="label mb-0">{label}</span>
      <div className="flex gap-3 items-start">
        <div className={`relative w-24 ${aspect} rounded-xl overflow-hidden bg-[#eef5fb] border border-line shrink-0`}>
          {value ? (
            <SmartImage src={value} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xs text-muted">No image</span>
          )}
        </div>
        <div className="grid gap-2 flex-1">
          <label className="btn-ghost text-sm cursor-pointer w-fit">
            {busy ? "Uploading…" : "Upload to Supabase"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
          <input
            className="input text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="or paste an image URL"
          />
        </div>
      </div>
    </div>
  );
}
