/**
 * Kurateret farvepalette til lysstyring (FEATURE_REQUIREMENTS §3:
 * enkel presets-palette, ikke farvehjul). Navne oversættes via
 * i18n-namespacet "lightColors".
 */
export interface LightColorPreset {
  id: string;
  nameKey: "amber" | "sunset" | "rose" | "lavender" | "ocean" | "forest";
  hex: string;
}

export const lightColorPresets: readonly LightColorPreset[] = [
  { id: "amber", nameKey: "amber", hex: "#f2b04a" },
  { id: "sunset", nameKey: "sunset", hex: "#e8734a" },
  { id: "rose", nameKey: "rose", hex: "#e28ca4" },
  { id: "lavender", nameKey: "lavender", hex: "#9d8ce0" },
  { id: "ocean", nameKey: "ocean", hex: "#4a9de8" },
  { id: "forest", nameKey: "forest", hex: "#5cab7d" },
] as const;

/** Farvetemperatur-grænser for pærer (typisk interval for smarte pærer). */
export const colorTemperature = {
  minK: 2200,
  maxK: 6500,
  stepK: 100,
  /** Grænser for sproglig beskrivelse i aria-valuetext og UI. */
  warmBelowK: 3300,
  coolAboveK: 5000,
} as const;
