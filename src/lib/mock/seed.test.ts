import { describe, expect, it } from "vitest";

import { buildMockHome, IDS, ROOMS } from "./seed";

describe("buildMockHome", () => {
  const data = buildMockHome();

  it("indeholder de syv krævede rum", () => {
    const names = data.rooms.map((r) => r.name).sort();
    expect(names).toEqual(
      [
        "Badeværelse",
        "Børneværelse",
        "Entré",
        "Køkken",
        "Soveværelse",
        "Spiseområde",
        "Stue",
      ].sort(),
    );
  });

  it("har den krævede belysning: 5 GU10, 7 E27 over spisebordet, bordlampe og væglampe", () => {
    const lights = data.entities.filter((e) => e.kind === "light");
    expect(lights.filter((l) => l.bulb === "gu10")).toHaveLength(5);
    expect(
      lights.filter((l) => l.bulb === "e27" && l.roomId === ROOMS.spise),
    ).toHaveLength(7);
    expect(lights.filter((l) => l.bulb === "e14")).toHaveLength(1);
    expect(lights).toHaveLength(14);
  });

  it("har grupper hvor alle medlemmer findes og er lys", () => {
    const byId = new Map(data.entities.map((e) => [e.id, e]));
    const groups = data.entities.filter((e) => e.kind === "lightGroup");
    expect(groups.length).toBeGreaterThanOrEqual(4);
    for (const group of groups) {
      expect(group.memberIds.length).toBeGreaterThan(0);
      for (const memberId of group.memberIds) {
        const member = byId.get(memberId);
        expect(member, `${group.name}: mangler ${memberId}`).toBeDefined();
        expect(member?.kind).toBe("light");
      }
    }
    const altLys = byId.get(IDS.gruppeAltLys);
    expect(altLys?.kind === "lightGroup" && altLys.memberIds).toHaveLength(14);
  });

  it("har unikke id'er for entiteter og enheder", () => {
    const entityIds = data.entities.map((e) => e.id);
    expect(new Set(entityIds).size).toBe(entityIds.length);
    const deviceIds = data.devices.map((d) => d.id);
    expect(new Set(deviceIds).size).toBe(deviceIds.length);
  });

  it("alle referencer er konsistente (rum, etager, enheder)", () => {
    const roomIds = new Set(data.rooms.map((r) => r.id));
    const floorIds = new Set(data.floors.map((f) => f.id));
    const entityIds = new Set(data.entities.map((e) => e.id));
    const deviceIds = new Set(data.devices.map((d) => d.id));

    for (const room of data.rooms)
      expect(floorIds.has(room.floorId)).toBe(true);
    for (const area of data.areas)
      for (const rid of area.roomIds) expect(roomIds.has(rid)).toBe(true);
    for (const entity of data.entities) {
      if (entity.roomId !== null) {
        expect(roomIds.has(entity.roomId), `${entity.id} har ukendt rum`).toBe(
          true,
        );
      }
      if (entity.deviceId !== null) {
        expect(
          deviceIds.has(entity.deviceId),
          `${entity.id} har ukendt device`,
        ).toBe(true);
      }
    }
    for (const device of data.devices) {
      for (const eid of device.entityIds) {
        expect(entityIds.has(eid), `${device.id} peger på ukendt entitet`).toBe(
          true,
        );
      }
    }
  });

  it("indeholder de aftalte fremtidsenheder", () => {
    const kinds = new Map<string, number>();
    for (const e of data.entities) {
      kinds.set(e.kind, (kinds.get(e.kind) ?? 0) + 1);
    }
    expect(kinds.get("lock")).toBe(1);
    expect(kinds.get("doorWindow")).toBe(5); // hoveddør, altandør + 3 vinduer
    expect(kinds.get("thermostat")).toBe(4);
    expect(kinds.get("airQuality")).toBe(2); // CO₂ + luftkvalitet
    expect(kinds.get("vacuum")).toBe(1);
    expect(kinds.get("energyMeter")).toBe(1);
    expect(kinds.get("motion")).toBe(1);
  });

  it("har tilbehøret: to dimmer switches og én motion sensor med tre entiteter", () => {
    const dimmers = data.devices.filter((d) =>
      d.model.includes("Dimmer Switch"),
    );
    expect(dimmers).toHaveLength(2);
    const motionDevice = data.devices.find(
      (d) => d.model === "Hue Motion Sensor",
    );
    expect(motionDevice?.entityIds).toHaveLength(3);
  });

  it("har alle 10 hverdagsscener med gyldige entitetsreferencer", () => {
    expect(data.scenes).toHaveLength(10);
    const entityIds = new Set(data.entities.map((e) => e.id));
    for (const scene of data.scenes) {
      expect(scene.actions.length).toBeGreaterThan(0);
      for (const action of scene.actions) {
        expect(
          entityIds.has(action.entityId),
          `${scene.name}: ukendt entitet ${action.entityId}`,
        ).toBe(true);
      }
    }
    const modes = data.scenes.filter((s) => s.sceneType === "mode");
    expect(modes.map((m) => m.name).sort()).toEqual([
      "Babytilstand",
      "Ferietilstand",
    ]);
  });
});
