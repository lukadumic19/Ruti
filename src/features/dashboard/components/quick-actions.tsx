"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { QuickActionButton } from "@/components/devices/quick-action-button";
import { sceneIcon } from "@/lib/icons";
import type { Scene, SceneId } from "@/types";

/** Rækkefølge og udvalg af hurtighandlinger på dashboardet (fase-opgaven). */
export const QUICK_ACTION_SCENE_IDS: readonly string[] = [
  "scene.godmorgen",
  "scene.vi-gaar-hjemmefra",
  "scene.vi-er-hjemme",
  "scene.aften",
  "scene.godnat",
  "scene.babytilstand",
  "scene.filmaften",
  "scene.rengoering",
];

/** Kortere etiketter til de brede knapper (data-navnene er nogle gange lange). */
const shortLabels: Record<string, string> = {
  "scene.vi-gaar-hjemmefra": "Vi går",
};

interface QuickActionsProps {
  scenes: ReadonlyMap<SceneId, Scene>;
  busySceneId: SceneId | null;
  recommendedSceneId: SceneId | null;
  disabled?: boolean;
  onActivate: (scene: Scene) => void;
}

/**
 * Store hurtighandlingsknapper til de vigtigste scener. Aktive tilstande
 * (baby/ferie) markeres; den anbefalede handling fremhæves.
 */
export function QuickActions({
  scenes,
  busySceneId,
  recommendedSceneId,
  disabled = false,
  onActivate,
}: QuickActionsProps) {
  const t = useTranslations("dashboard");

  const items = QUICK_ACTION_SCENE_IDS.map((id) =>
    scenes.get(id as SceneId),
  ).filter((s): s is Scene => s !== undefined);

  if (items.length === 0) return null;

  return (
    <section aria-label={t("quickActions")}>
      <h2 className="sr-only">{t("quickActions")}</h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {items.map((scene) => {
          const isRecommended = scene.id === recommendedSceneId;
          return (
            <QuickActionButton
              key={scene.id}
              icon={sceneIcon(scene.icon)}
              label={shortLabels[scene.id] ?? scene.name}
              active={
                scene.sceneType === "mode" ? scene.active === true : false
              }
              busy={busySceneId === scene.id}
              disabled={disabled}
              onClick={() => onActivate(scene)}
              className={
                isRecommended
                  ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                  : undefined
              }
            />
          );
        })}
      </div>
    </section>
  );
}
