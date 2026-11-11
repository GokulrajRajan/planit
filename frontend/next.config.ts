import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  // The dev server only serves its scripts and hot-reload socket to localhost by default; without this,
  // opening the site from another device on the LAN (http://192.168.x.x:3000) never hydrates.
  allowedDevOrigins: ["192.168.*.*"],
  // Service pages moved from /services/<slug> to the product URLs (e.g. /mutual-funds/sip-planning).
  async redirects() {
    return [
      { source: "/services/mutual-funds", destination: "/mutual-funds", permanent: true },
      { source: "/services/sip-planning", destination: "/mutual-funds/sip-planning", permanent: true },
      { source: "/services/goal-planning", destination: "/mutual-funds/goal-planning", permanent: true },
      { source: "/services/retirement-planning", destination: "/mutual-funds/retirement-planning", permanent: true },
      { source: "/services/tax-saving-investments", destination: "/mutual-funds/tax-planning", permanent: true },
      { source: "/services/insurance-review", destination: "/protect/insurance-review", permanent: true },
      // The Tax Saving calculator was removed; its old link lands on the Tax Saving Investments page.
      { source: "/calculators/tax-saving", destination: "/mutual-funds/tax-planning", permanent: true },
    ];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
