import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/chat',
        destination: 'http://127.0.0.1:8001/api/v1/chat',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
      {
        source: '/ai/:path*',
        destination: 'http://127.0.0.1:8001/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
