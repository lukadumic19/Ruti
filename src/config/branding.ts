/**
 * Al branding samles her, så et navneskifte er én fil (ADR-0004).
 * Ingen andre steder i koden må appnavnet forekomme.
 */
export const branding = {
  appName: "Atlas Home",
  shortName: "Atlas",
  description: "Familiens smarte hjem – enkelt og samlet",
  themeColor: { light: "#f7f5f2", dark: "#26231f" },
} as const;
