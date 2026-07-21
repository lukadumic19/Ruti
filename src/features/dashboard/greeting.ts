import type { SceneId } from "@/types";
import { sceneId } from "@/types";

/** Situationsafhængig hilsen (PRODUCT_VISION §6). Ren funktion → testbar. */
export type GreetingSlot = "morning" | "afternoon" | "evening" | "night";

export function greetingSlot(date: Date): GreetingSlot {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  return "night";
}

/**
 * Anbefalet næste scene ud fra tidspunktet. Efter kl. 21 fremhæves Godnat
 * (PRODUCT_VISION §6 / FEATURE_REQUIREMENTS §1). Returnerer scene-id'et, hvis
 * en tilsvarende scene findes i det aktuelle hjem.
 */
export function recommendedSceneId(
  date: Date,
  availableSceneIds: ReadonlySet<string>,
): SceneId | null {
  const h = date.getHours();
  const preference =
    h >= 21 || h < 5
      ? "scene.godnat"
      : h >= 18
        ? "scene.aften"
        : h >= 12
          ? "scene.vi-er-hjemme"
          : "scene.godmorgen";
  return availableSceneIds.has(preference) ? sceneId(preference) : null;
}
