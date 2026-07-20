import type { AreaId, FloorId, HomeId, MemberId, RoomId } from "./ids";

export interface Home {
  id: HomeId;
  name: string;
}

export interface Floor {
  id: FloorId;
  homeId: HomeId;
  name: string;
  /** 0 = stueetage, 1 = 1. sal, -1 = kælder. */
  level: number;
}

/** Ikon-nøgle – mappes til Lucide-ikoner i UI-laget. */
export type RoomIcon =
  "sofa" | "utensils" | "cooking-pot" | "bed" | "bath" | "door-open" | "baby";

export interface Room {
  id: RoomId;
  floorId: FloorId;
  name: string;
  icon: RoomIcon;
}

/** Logisk zone på tværs af rum/etager, fx "Fællesrum" eller "Soverum". */
export interface Area {
  id: AreaId;
  name: string;
  roomIds: readonly RoomId[];
}

export type MemberRole = "adult" | "child" | "guest" | "wallpanel";

export interface HouseholdMember {
  id: MemberId;
  name: string;
  role: MemberRole;
}
