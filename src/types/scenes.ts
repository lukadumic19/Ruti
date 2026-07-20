import type { SceneId } from "./ids";
import type { ServiceCall } from "./services";

/**
 * Appens egne domænescener (FEATURE_REQUIREMENTS §4).
 * "oneShot" udføres én gang; "mode" er en vedvarende tilstand (baby, ferie).
 */
export interface Scene {
  id: SceneId;
  name: string;
  /** Ikon-nøgle – mappes til Lucide i UI-laget. */
  icon: string;
  sceneType: "oneShot" | "mode";
  /** Kun relevant for "mode"-scener; null for oneShot. */
  active: boolean | null;
  actions: readonly ServiceCall[];
  pinnedOnDashboard: boolean;
}
