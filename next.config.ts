import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://127.0.0.1:8001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/chat",
        destination: `${AI_ENGINE_URL}/api/v1/chat`,
      },
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/ai/:path*",
        destination: `${AI_ENGINE_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
