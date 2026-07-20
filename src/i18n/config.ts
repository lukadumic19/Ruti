/**
 * Dansk er eneste sprog i v1. Nye sprog: tilføj locale her + en beskedfil i
 * src/i18n/messages/ – ingen kodeændringer derudover (TECHNICAL_ARCHITECTURE §9).
 */
export const locales = ["da"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "da";
