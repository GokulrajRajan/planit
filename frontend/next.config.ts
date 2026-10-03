import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  // The dev server only serves its scripts and hot-reload socket to localhost by default; without this,
  // opening the site from another device on the LAN (http://192.168.x.x:3000) never hydrates.
  allowedDevOrigins: ["192.168.*.*"],
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
