import type { NextConfig } from "next";
import path from "node:path";

function buildContentSecurityPolicy() {
  const connectSrc = [
    "'self'",
    "https://generativelanguage.googleapis.com",
    "https://*.supabase.co",
    "wss://*.supabase.co"
  ];

  if (process.env.NODE_ENV !== "production") {
    connectSrc.push("ws://127.0.0.1:3000", "ws://localhost:3000");
  }

  const scriptSrc = ["'self'", "'unsafe-inline'"];

  if (process.env.NODE_ENV !== "production") {
    scriptSrc.push("'unsafe-eval'");
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ");
}

function getRemotePatterns() {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (supabaseUrl) {
    patterns.push({
      hostname: new URL(supabaseUrl).hostname,
      protocol: "https"
    });
  }

  return patterns;
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy()
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          }
        ],
        source: "/:path*"
      }
    ];
  },
  images: {
    remotePatterns: getRemotePatterns()
  },
  typedRoutes: true,
  outputFileTracingRoot: path.resolve(__dirname)
};

export default nextConfig;
