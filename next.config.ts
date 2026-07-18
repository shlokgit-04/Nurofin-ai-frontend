import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/chat',
        destination: 'http://127.0.0.1:8001/api/v1/chat',
      },
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
      {
        source: '/ai/:path*',
        destination: 'http://127.0.0.1:8001/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
