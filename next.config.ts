import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  // Service workeren bygges kun i produktion; i dev støjer den i cache-adfærd.
  disable: process.env.NODE_ENV !== "production",
});

const isDev = process.env.NODE_ENV !== "production";

// CSP jf. SECURITY_MODEL §4: ingen tredjeparts-scripts/CDN'er.
// 'unsafe-inline' for script/style kræves af Next' bootstrap-inlines;
// 'unsafe-eval' er KUN nødvendig i dev (react-refresh/source maps).
const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval'"
  : "'self' 'unsafe-inline'";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`,
        },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "same-origin" },
      ],
    },
  ],
};

export default withSerwist(withNextIntl(nextConfig));
