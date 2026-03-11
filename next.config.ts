import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
      {
        protocol: 'http',
        hostname: '35.246.89.127',
      },
    ],
  },
};

export default nextConfig;
