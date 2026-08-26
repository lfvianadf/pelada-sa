import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 3600,
      static: 3600,
    },
  },
};

export default nextConfig;
