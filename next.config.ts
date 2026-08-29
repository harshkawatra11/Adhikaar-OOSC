import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // The interior workspace moved from /docket to /my (and /docket/new to
  // /start) to speak to a citizen rather than a Common Service Centre
  // operator. These keep any link shared before that rename working.
  // Order matters: /docket/new must be matched before the dynamic
  // /docket/:id rule, or the dynamic rule swallows it first.
  async redirects() {
    return [
      { source: "/docket/new", destination: "/start", permanent: true },
      { source: "/docket", destination: "/my", permanent: true },
      { source: "/docket/:id", destination: "/my/:id", permanent: true },
    ];
  },
};

export default nextConfig;
