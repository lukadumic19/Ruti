import { describe, expect, it } from "vitest";

import { buildMockHome, IDS } from "@/lib/mock/seed";
import type { Device, DoorLock, Entity, Light } from "@/types";

import {
  buildHomeSummary,
  buildStatusItems,
  lightsOnCountByRoom,
} from "./derive";

function summaryFrom(overrides?: { entities?: Entity[]; devices?: Device[] }) {
  const data = buildMockHome();
  return buildHomeSummary({
    entities: overrides?.entities ?? data.entities,
    devices: overrides?.devices ?? data.devices,
    scenes: data.scenes,
    rooms: data.rooms,
  });
}

describe("buildHomeSummary", () => {
  it("tæller kun tændte, tilgængelige enkeltlamper (ikke grupper)", () => {
    const summary = summaryFrom();
    // Seed: kun bordlampen er tændt fra start.
    expect(summary.activeLightCount).toBe(1);
    expect(summary.activeLights.every((l) => l.kind === "light")).toBe(true);
  });

  it("rapporterer at hjemmet er låst og alt er lukket i udgangstilstand", () => {
    const summary = summaryFrom();
    expect(summary.security.hasLock).toBe(true);
    expect(summary.security.allLocked).toBe(true);
    expect(summary.security.anyJammed).toBe(false);
    expect(summary.security.openOpenings).toHaveLength(0);
  });

  it("registrerer åbne døre/vinduer", () => {
    const data = buildMockHome();
    const entities = data.entities.map((e): Entity =>
      e.id === IDS.doerAltan && e.kind === "doorWindow"
        ? { ...e, state: { open: true, openSince: "2026-07-20T10:00:00.000Z" } }
        : e,
    );
    const summary = buildHomeSummary({
      entities,
      devices: data.devices,
      scenes: data.scenes,
      rooms: data.rooms,
    });
    expect(summary.security.openOpenings).toHaveLength(1);
    expect(summary.security.openOpenings[0]?.name).toBe("Altandør");
  });

  it("beregner klima med gennemsnitstemperatur", () => {
    const summary = summaryFrom();
    expect(summary.climate.rooms.length).toBeGreaterThan(0);
    expect(summary.climate.averageTempC).not.toBeNull();
    expect(summary.climate.averageTempC).toBeGreaterThan(15);
    expect(summary.climate.averageTempC).toBeLessThan(30);
  });

  it("finder offline-enheder og laver en advarsel", () => {
    const data = buildMockHome();
    const devices = data.devices.map((d): Device =>
      d.id === data.devices[0]?.id ? { ...d, connectivity: "offline" } : d,
    );
    const summary = buildHomeSummary({
      entities: data.entities,
      devices,
      scenes: data.scenes,
      rooms: data.rooms,
    });
    expect(summary.offlineDevices).toHaveLength(1);
    expect(summary.warnings.some((w) => w.kind === "offlineDevice")).toBe(true);
  });

  it("laver kritisk advarsel når låsen sidder fast", () => {
    const data = buildMockHome();
    const entities = data.entities.map((e): Entity =>
      e.kind === "lock"
        ? ({ ...e, state: { status: "jammed" } } as DoorLock)
        : e,
    );
    const summary = buildHomeSummary({
      entities,
      devices: data.devices,
      scenes: data.scenes,
      rooms: data.rooms,
    });
    expect(summary.security.anyJammed).toBe(true);
    const jam = summary.warnings.find((w) => w.kind === "lockJammed");
    expect(jam?.severity).toBe("critical");
    // Kritiske advarsler sorteres først.
    expect(summary.warnings[0]?.severity).toBe("critical");
  });

  it("markerer dårlig luftkvalitet som advarsel", () => {
    const data = buildMockHome();
    const entities = data.entities.map((e): Entity =>
      e.id === IDS.co2Boerne && e.kind === "airQuality"
        ? { ...e, state: { co2Ppm: 1600, pm25: null } }
        : e,
    );
    const summary = buildHomeSummary({
      entities,
      devices: data.devices,
      scenes: data.scenes,
      rooms: data.rooms,
    });
    expect(summary.airQuality.worst).toBe("poor");
    expect(summary.warnings.some((w) => w.kind === "airQualityPoor")).toBe(
      true,
    );
  });

  it("registrerer aktiv babytilstand fra mode-scene", () => {
    const data = buildMockHome();
    const scenes = data.scenes.map((s) =>
      s.id === "scene.babytilstand" ? { ...s, active: true } : s,
    );
    const summary = buildHomeSummary({
      entities: data.entities,
      devices: data.devices,
      scenes,
      rooms: data.rooms,
    });
    expect(summary.babyModeActive).toBe(true);
  });

  it("finder hjemmets energimåler", () => {
    const summary = summaryFrom();
    expect(summary.energy?.scope).toBe("home");
    expect(summary.energy?.state.powerW).not.toBeNull();
  });
});

describe("buildStatusItems", () => {
  it("sorterer det mest kritiske først", () => {
    const data = buildMockHome();
    const entities = data.entities.map((e): Entity =>
      e.kind === "lock"
        ? ({ ...e, state: { status: "jammed" } } as DoorLock)
        : e,
    );
    const summary = buildHomeSummary({
      entities,
      devices: data.devices,
      scenes: data.scenes,
      rooms: data.rooms,
    });
    const items = buildStatusItems(summary);
    expect(items[0]?.severity).toBe("critical");
    expect(items[0]?.kind).toBe("lock");
  });

  it("inkluderer altid lys- og døre/vinduer-status", () => {
    const items = buildStatusItems(summaryFrom());
    expect(items.some((i) => i.kind === "lightsOn")).toBe(true);
    expect(items.some((i) => i.kind === "openings")).toBe(true);
  });
});

describe("lightsOnCountByRoom", () => {
  it("tæller kun tændte enkeltlamper pr. rum", () => {
    const light: Light = {
      kind: "light",
      id: IDS.bordlampe,
      name: "Bordlampe",
      roomId: null,
      deviceId: null,
      availability: "available",
      lastUpdated: "2026-07-20T06:30:00.000Z",
      bulb: "e27",
      capabilities: { dim: true, colorTemp: null, color: true },
      state: { on: true, brightnessPct: 60, colorTempK: null, colorRgb: null },
    };
    const withRoom = { ...light, roomId: buildMockHome().rooms[0]!.id };
    const counts = lightsOnCountByRoom([withRoom]);
    expect(counts.get(withRoom.roomId)).toBe(1);
  });
});
