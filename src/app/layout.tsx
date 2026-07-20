import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { Providers } from "@/components/providers";
import { branding } from "@/config/branding";
import { defaultLocale } from "@/i18n/config";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: branding.appName, template: `%s – ${branding.appName}` },
  description: branding.description,
  applicationName: branding.appName,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: branding.appName,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: branding.themeColor.light,
    },
    { media: "(prefers-color-scheme: dark)", color: branding.themeColor.dark },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return (
    // suppressHydrationWarning: next-themes sætter class på <html> før hydration
    <html lang={defaultLocale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
