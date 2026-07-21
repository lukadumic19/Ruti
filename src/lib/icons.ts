import {
  Bath,
  Bed,
  Clapperboard,
  CookingPot,
  DoorOpen,
  Home,
  Lamp,
  LayoutGrid,
  LogOut,
  Moon,
  Plane,
  Sofa,
  Sparkles,
  Sunrise,
  Sunset,
  Utensils,
  type LucideIcon,
} from "lucide-react";

import type { RoomIcon } from "@/types";

/** Mapper scene-ikonnøgler (data) til Lucide-komponenter. */
const sceneIcons: Record<string, LucideIcon> = {
  sunrise: Sunrise,
  "log-out": LogOut,
  home: Home,
  sunset: Sunset,
  tv: Clapperboard,
  moon: Moon,
  baby: Bed,
  lamp: Lamp,
  sparkles: Sparkles,
  plane: Plane,
};

export function sceneIcon(key: string): LucideIcon {
  return sceneIcons[key] ?? Sparkles;
}

const roomIcons: Record<RoomIcon, LucideIcon> = {
  sofa: Sofa,
  utensils: Utensils,
  "cooking-pot": CookingPot,
  bed: Bed,
  bath: Bath,
  "door-open": DoorOpen,
  baby: Bed,
};

export function roomIcon(key: RoomIcon): LucideIcon {
  return roomIcons[key] ?? LayoutGrid;
}
