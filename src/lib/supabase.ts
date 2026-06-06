import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const STORAGE_BUCKETS = {
  products: "products",
  hero: "hero",
  banners: "banners",
} as const;

let client: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  client = createClient(supabaseUrl as string, supabaseAnonKey as string, {
    auth: { persistSession: false },
  });
}

export const supabase = client;

function requireSupabase(): SupabaseClient {
  if (!client) {
    throw new Error(
      "Supabase is not configured. Add your Supabase keys to .env.local (see SETUP.md)."
    );
  }
  return client;
}

/**
 * Upload an image to a Supabase storage bucket and return its public URL.
 * Free-tier optimized: compresses filename, uses upsert, no duplicate copies.
 */
export async function uploadImage(
  bucket: keyof typeof STORAGE_BUCKETS,
  file: File,
  folder = ""
): Promise<string> {
  const sb = requireSupabase();
  const bucketName = STORAGE_BUCKETS[bucket];
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safe = `${folder ? folder + "/" : ""}${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await sb.storage.from(bucketName).upload(safe, file, {
    cacheControl: "31536000",
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = sb.storage.from(bucketName).getPublicUrl(safe);
  return data.publicUrl;
}

/** Delete an image from storage by its public URL. */
export async function deleteImageByUrl(url: string): Promise<void> {
  if (!client || !url || !url.includes("/storage/v1/object/public/")) return;
  const sb = client;
  const after = url.split("/storage/v1/object/public/")[1];
  if (!after) return;
  const [bucketName, ...rest] = after.split("/");
  const path = rest.join("/");
  if (!bucketName || !path) return;
  await sb.storage.from(bucketName).remove([path]);
}

/** Ensure the three buckets exist (idempotent). Used by Initialize Database. */
export async function ensureBuckets(): Promise<string[]> {
  const sb = requireSupabase();
  const created: string[] = [];
  for (const name of Object.values(STORAGE_BUCKETS)) {
    const { data } = await sb.storage.getBucket(name);
    if (!data) {
      const { error } = await sb.storage.createBucket(name, {
        public: true,
        fileSizeLimit: 3 * 1024 * 1024, // 3MB cap per file for free tier
      });
      if (!error) created.push(name);
    }
  }
  return created;
}

/** Clear all files in the storage buckets. Used by Reset Database. */
export async function clearAllBuckets(): Promise<void> {
  const sb = requireSupabase();
  for (const name of Object.values(STORAGE_BUCKETS)) {
    const { data: files } = await sb.storage.from(name).list("", { limit: 1000 });
    if (files && files.length) {
      const paths = files.map((f) => f.name);
      await sb.storage.from(name).remove(paths);
    }
  }
}
