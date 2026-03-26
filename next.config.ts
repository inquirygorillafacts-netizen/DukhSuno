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
