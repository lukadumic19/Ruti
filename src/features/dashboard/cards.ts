/**
 * Datamodel for dashboardets kort. Foreløbig: definerer rækkefølge og
 * synlighed, så en editor (skjul/omarrangér) kan bygges senere uden at ændre
 * selve kortene. Der er ingen fuld editor endnu (jf. fase-opgaven).
 */
export type DashboardCardId =
  | "security"
  | "openings"
  | "climate"
  | "airQuality"
  | "favoriteRooms"
  | "activeLights"
  | "vacuum"
  | "energy"
  | "warnings"
  | "recentEvents"
  | "baby";

export interface DashboardCardConfig {
  id: DashboardCardId;
  visible: boolean;
}

/** Standardlayout. Rækkefølgen afspejler prioriteten sikkerhed → komfort → info. */
export const defaultDashboardLayout: readonly DashboardCardConfig[] = [
  { id: "warnings", visible: true },
  { id: "security", visible: true },
  { id: "openings", visible: true },
  { id: "baby", visible: true },
  { id: "climate", visible: true },
  { id: "airQuality", visible: true },
  { id: "favoriteRooms", visible: true },
  { id: "activeLights", visible: true },
  { id: "vacuum", visible: true },
  { id: "energy", visible: true },
  { id: "recentEvents", visible: true },
] as const;

/** Rum der som standard vises som favoritter på dashboardet. */
export const defaultFavoriteRoomIds: readonly string[] = [
  "room.stue",
  "room.koekken",
  "room.sovevaerelse",
];
