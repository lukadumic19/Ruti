import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "../../../../tests/test-utils";
import { buildMockHome } from "@/lib/mock/seed";
import type { Scene, SceneId } from "@/types";

import { QUICK_ACTION_SCENE_IDS, QuickActions } from "./quick-actions";

function sceneMap(): ReadonlyMap<SceneId, Scene> {
  return new Map(buildMockHome().scenes.map((s) => [s.id, s]));
}

describe("QuickActions", () => {
  it("viser en knap for hver konfigureret hurtighandling", () => {
    renderWithIntl(
      <QuickActions
        scenes={sceneMap()}
        busySceneId={null}
        recommendedSceneId={null}
        onActivate={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(
      QUICK_ACTION_SCENE_IDS.length,
    );
    expect(screen.getByRole("button", { name: /Godnat/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Vi går/ })).toBeInTheDocument();
  });

  it("kalder onActivate med scenen ved klik", async () => {
    const onActivate = vi.fn();
    renderWithIntl(
      <QuickActions
        scenes={sceneMap()}
        busySceneId={null}
        recommendedSceneId={null}
        onActivate={onActivate}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Godmorgen/ }));
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate.mock.calls[0]?.[0]?.id).toBe("scene.godmorgen");
  });

  it("markerer den scene der kører som optaget", () => {
    renderWithIntl(
      <QuickActions
        scenes={sceneMap()}
        busySceneId={"scene.godnat" as SceneId}
        recommendedSceneId={null}
        onActivate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /Godnat/ })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("markerer aktiv mode-scene (babytilstand) med aria-pressed", () => {
    const scenes = new Map(
      buildMockHome().scenes.map((s): [SceneId, Scene] => [
        s.id,
        s.id === "scene.babytilstand" ? { ...s, active: true } : s,
      ]),
    );
    renderWithIntl(
      <QuickActions
        scenes={scenes}
        busySceneId={null}
        recommendedSceneId={null}
        onActivate={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Babytilstand/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("deaktiverer alle knapper når hjemmet er offline", () => {
    renderWithIntl(
      <QuickActions
        scenes={sceneMap()}
        busySceneId={null}
        recommendedSceneId={null}
        disabled
        onActivate={vi.fn()}
      />,
    );
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });
});
