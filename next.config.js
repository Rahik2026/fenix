/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).hostname : null;
  } catch {
    return null;
  }
})();

const remotePatterns = [
  { protocol: "https", hostname: "*.supabase.co" },
  { protocol: "https", hostname: "*.supabase.in" },
];
if (supabaseHost) {
  remotePatterns.push({ protocol: "https", hostname: supabaseHost });
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
