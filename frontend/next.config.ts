import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb", // optional: limit request body size
      allowedOrigins: ["*"], // optional: allow all origins
    },
  },
};

export default nextConfig;