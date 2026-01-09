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

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    // Allow SVGs and data/blob sources for images used by Next/Image
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; img-src * blob: data:; media-src * blob: data:;",
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
  async redirects() {
    return [
      {
        source: "/why-robotics",
        destination:
          "https://docs.google.com/forms/d/e/1FAIpQLScMlBUzXuKBPt_yLI6m7dHB5FpfMy4WpKILldnxzKasasO_-A/viewform?usp=header",
        permanent: true,
      },
    ];
  },
} as unknown as NextConfig;

export default nextConfig;
