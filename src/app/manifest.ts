import type { MetadataRoute } from "next";

import { branding } from "@/config/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: branding.appName,
    short_name: branding.shortName,
    description: branding.description,
    lang: "da",
    start_url: "/",
    display: "standalone",
    background_color: branding.themeColor.light,
    theme_color: branding.themeColor.light,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
