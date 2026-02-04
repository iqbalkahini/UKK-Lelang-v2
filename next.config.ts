import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ubfhltidpyohdywcsrvj.supabase.co",
      },
    ],
  },
};

export default nextConfig;
