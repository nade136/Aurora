import type { NextConfig } from "next";

// Derive Supabase hostname from env to support multiple environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseHost: string | null = null;
try {
  if (supabaseUrl) {
    const u = new URL(supabaseUrl);
    supabaseHost = u.hostname;
  }
} catch {}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Existing explicit host (kept)
      {
        protocol: "https",
        hostname: "dkqqzrboopgmospsoyjf.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Host from env (if provided)
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
