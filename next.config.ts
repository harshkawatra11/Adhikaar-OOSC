import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // firebase-admin/auth pulls in jwks-rsa, which does a CommonJS
  // require() of the "jose" package's ESM build. Bundled by Turbopack
  // into the serverless function, that require() throws ERR_REQUIRE_ESM
  // at runtime on Vercel (never surfaced locally under `next dev`, only
  // in the actual deployed production function, which is what made this
  // easy to miss until a real request against the live URL hit it: every
  // sign-in returned a 500 from /api/auth/session). serverExternalPackages
  // tells Next.js to leave firebase-admin as a real, unbundled
  // node_modules import in the serverless output instead of trying to
  // bundle it, which is exactly what its own CJS/ESM interop needs.
  serverExternalPackages: ["firebase-admin"],
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
