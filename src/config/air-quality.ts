/**
 * Grænseværdier for luftkvalitet (FEATURE_REQUIREMENTS §9). Dokumenteret kilde,
 * ikke hardcodet i UI. Niveauerne oversættes til dansk trafiklys i UI-laget.
 */
export type AirQualityLevel = "good" | "moderate" | "poor";

/** CO₂ i ppm. Baseret på gængse anbefalinger for indeklima. */
export const co2Thresholds = {
  /** Under dette: god luft. */
  goodBelow: 800,
  /** Over dette: luft ud nu. Mellem de to: luft ud snart. */
  poorAbove: 1000,
} as const;

/** PM2.5 i µg/m³ (WHO-inspireret). */
export const pm25Thresholds = {
  goodBelow: 15,
  poorAbove: 35,
} as const;

export function co2Level(ppm: number): AirQualityLevel {
  if (ppm < co2Thresholds.goodBelow) return "good";
  if (ppm > co2Thresholds.poorAbove) return "poor";
  return "moderate";
}

export function pm25Level(value: number): AirQualityLevel {
  if (value < pm25Thresholds.goodBelow) return "good";
  if (value > pm25Thresholds.poorAbove) return "poor";
  return "moderate";
}

const rank: Record<AirQualityLevel, number> = { good: 0, moderate: 1, poor: 2 };

/** Returnerer det værste (mest alvorlige) af to niveauer. */
export function worstLevel(
  a: AirQualityLevel,
  b: AirQualityLevel,
): AirQualityLevel {
  return rank[a] >= rank[b] ? a : b;
}
