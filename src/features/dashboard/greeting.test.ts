import { describe, expect, it } from "vitest";

import { greetingSlot, recommendedSceneId } from "./greeting";

function at(hour: number): Date {
  const d = new Date("2026-07-20T00:00:00");
  d.setHours(hour, 0, 0, 0);
  return d;
}

describe("greetingSlot", () => {
  it("vælger korrekt hilsen ud fra klokkeslæt", () => {
    expect(greetingSlot(at(7))).toBe("morning");
    expect(greetingSlot(at(14))).toBe("afternoon");
    expect(greetingSlot(at(20))).toBe("evening");
    expect(greetingSlot(at(23))).toBe("night");
    expect(greetingSlot(at(3))).toBe("night");
  });
});

describe("recommendedSceneId", () => {
  const available = new Set([
    "scene.godmorgen",
    "scene.aften",
    "scene.godnat",
    "scene.vi-er-hjemme",
  ]);

  it("anbefaler Godnat sent om aftenen", () => {
    expect(recommendedSceneId(at(22), available)).toBe("scene.godnat");
  });

  it("anbefaler Godmorgen om morgenen", () => {
    expect(recommendedSceneId(at(7), available)).toBe("scene.godmorgen");
  });

  it("returnerer null hvis scenen ikke findes", () => {
    expect(recommendedSceneId(at(22), new Set())).toBeNull();
  });
});
