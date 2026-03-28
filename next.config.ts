import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  // Ensure we don't block requests based on the Host header in development
  // This is required when using tunnels like cloudflared
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 20,
  },
  async redirects() {
    return [
      {
        source: '/sunane/:path*',
        destination: '/seeker/:path*',
        permanent: true,
      },
      {
        source: '/sunne/:path*',
        destination: '/provider/:path*',
        permanent: true,
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.cache = {
        type: 'filesystem',
      };
      config.watchOptions = {
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
