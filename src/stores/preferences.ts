"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { storageKey } from "@/config/storage";

/**
 * Persisterede UI-præferencer (TECHNICAL_ARCHITECTURE §7).
 * KUN UI-state hører til her – aldrig data fra Home Assistant (ADR-0008).
 * Vægpanel-tilstanden får sin fulde adfærd i en senere fase (DESIGN_PRINCIPLES §3).
 */
interface PreferencesState {
  wallPanelMode: boolean;
  setWallPanelMode: (enabled: boolean) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      wallPanelMode: false,
      setWallPanelMode: (enabled) => set({ wallPanelMode: enabled }),
    }),
    {
      name: storageKey("preferences"),
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
