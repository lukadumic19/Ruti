import {
  co2Level,
  pm25Level,
  worstLevel,
  type AirQualityLevel,
} from "@/config/air-quality";
import type {
  Device,
  DoorLock,
  DoorWindowSensor,
  EnergyMeter,
  Entity,
  Light,
  Room,
  RoomId,
  Scene,
  Vacuum,
} from "@/types";
import { hasLowBattery } from "@/types";

/**
 * Ren afledning af hjemmets tilstand til dashboardet. Ingen React, ingen i18n –
 * kun struktureret data, som præsentationslaget oversætter (TEST_STRATEGY §2).
 */

export interface ClimateRoomReading {
  roomId: RoomId | null;
  roomName: string;
  temperatureC: number | null;
  humidityPct: number | null;
}

export interface AirQualityReading {
  name: string;
  co2Ppm: number | null;
  pm25: number | null;
  level: AirQualityLevel;
}

export type DashboardWarning =
  | { kind: "lockJammed"; name: string; severity: "critical" }
  | { kind: "offlineDevice"; name: string; severity: "warning" }
  | {
      kind: "airQualityPoor";
      name: string;
      co2Ppm: number | null;
      severity: "warning";
    }
  | { kind: "lowBattery"; name: string; pct: number; severity: "warning" }
  | { kind: "vacuumStuck"; name: string; severity: "warning" };

export interface HomeSummary {
  activeLights: Light[];
  activeLightCount: number;
  security: {
    locks: DoorLock[];
    hasLock: boolean;
    allLocked: boolean;
    anyJammed: boolean;
    openings: DoorWindowSensor[];
    openOpenings: DoorWindowSensor[];
  };
  climate: {
    rooms: ClimateRoomReading[];
    averageTempC: number | null;
  };
  airQuality: {
    readings: AirQualityReading[];
    worst: AirQualityLevel | null;
  };
  offlineDevices: Device[];
  vacuum: Vacuum | null;
  energy: EnergyMeter | null;
  babyModeActive: boolean;
  warnings: DashboardWarning[];
}

export interface HomeSummaryInput {
  entities: Iterable<Entity>;
  devices: Iterable<Device>;
  scenes: Iterable<Scene>;
  rooms: readonly Room[];
}

/** Antal tændte, tilgængelige enkeltlamper pr. rum (grupper tælles ikke med). */
export function lightsOnCountByRoom(
  entities: Iterable<Entity>,
): Map<RoomId, number> {
  const counts = new Map<RoomId, number>();
  for (const e of entities) {
    if (
      e.kind === "light" &&
      e.availability === "available" &&
      e.state.on &&
      e.roomId !== null
    ) {
      counts.set(e.roomId, (counts.get(e.roomId) ?? 0) + 1);
    }
  }
  return counts;
}

const BABY_SCENE_ID = "scene.babytilstand";

export function buildHomeSummary(input: HomeSummaryInput): HomeSummary {
  const entities = [...input.entities];
  const devices = [...input.devices];
  const roomName = new Map(input.rooms.map((r) => [r.id, r.name]));

  const activeLights = entities.filter(
    (e): e is Light =>
      e.kind === "light" && e.availability === "available" && e.state.on,
  );

  const locks = entities.filter((e): e is DoorLock => e.kind === "lock");
  const openings = entities.filter(
    (e): e is DoorWindowSensor => e.kind === "doorWindow",
  );
  const openOpenings = openings.filter((o) => o.state.open);
  const anyJammed = locks.some((l) => l.state.status === "jammed");
  const allLocked =
    locks.length > 0 && locks.every((l) => l.state.status === "locked");

  const climate = buildClimate(entities, roomName);
  const airQuality = buildAirQuality(entities, roomName);

  const offlineDevices = devices.filter((d) => d.connectivity === "offline");
  const vacuum = entities.find((e): e is Vacuum => e.kind === "vacuum") ?? null;
  const energy =
    entities.find(
      (e): e is EnergyMeter => e.kind === "energyMeter" && e.scope === "home",
    ) ?? null;

  const babyModeActive = [...input.scenes].some(
    (s) => s.id === BABY_SCENE_ID && s.active === true,
  );

  const warnings = buildWarnings({
    locks,
    offlineDevices,
    airQualityReadings: airQuality.readings,
    devices,
    vacuum,
  });

  return {
    activeLights,
    activeLightCount: activeLights.length,
    security: {
      locks,
      hasLock: locks.length > 0,
      allLocked,
      anyJammed,
      openings,
      openOpenings,
    },
    climate,
    airQuality,
    offlineDevices,
    vacuum,
    energy,
    babyModeActive,
    warnings,
  };
}

function buildClimate(
  entities: readonly Entity[],
  roomName: ReadonlyMap<RoomId, string>,
): HomeSummary["climate"] {
  const tempByRoom = new Map<RoomId, number>();
  const humByRoom = new Map<RoomId, number>();

  // Termostater har forrang for temperatur (måler den faktiske rumtemperatur).
  for (const e of entities) {
    if (e.kind === "thermostat" && e.roomId) {
      tempByRoom.set(e.roomId, e.state.currentC);
    }
  }
  for (const e of entities) {
    if (e.kind !== "sensor" || e.roomId === null || e.state.value === null)
      continue;
    if (e.metric === "temperature" && !tempByRoom.has(e.roomId)) {
      tempByRoom.set(e.roomId, e.state.value);
    } else if (e.metric === "humidity") {
      humByRoom.set(e.roomId, e.state.value);
    }
  }

  const roomIds = new Set<RoomId>([...tempByRoom.keys(), ...humByRoom.keys()]);
  const rooms: ClimateRoomReading[] = [...roomIds].map((id) => ({
    roomId: id,
    roomName: roomName.get(id) ?? "Øvrige",
    temperatureC: tempByRoom.get(id) ?? null,
    humidityPct: humByRoom.get(id) ?? null,
  }));
  rooms.sort((a, b) => a.roomName.localeCompare(b.roomName, "da"));

  const temps = [...tempByRoom.values()];
  const averageTempC =
    temps.length > 0
      ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10
      : null;

  return { rooms, averageTempC };
}

function buildAirQuality(
  entities: readonly Entity[],
  roomName: ReadonlyMap<RoomId, string>,
): HomeSummary["airQuality"] {
  const readings: AirQualityReading[] = [];
  for (const e of entities) {
    if (e.kind !== "airQuality") continue;
    const levels: AirQualityLevel[] = [];
    if (e.state.co2Ppm !== null) levels.push(co2Level(e.state.co2Ppm));
    if (e.state.pm25 !== null) levels.push(pm25Level(e.state.pm25));
    const level = levels.reduce<AirQualityLevel>(
      (acc, l) => worstLevel(acc, l),
      "good",
    );
    readings.push({
      name: e.roomId ? (roomName.get(e.roomId) ?? e.name) : e.name,
      co2Ppm: e.state.co2Ppm,
      pm25: e.state.pm25,
      level,
    });
  }
  const worst =
    readings.length > 0
      ? readings.reduce<AirQualityLevel>(
          (acc, r) => worstLevel(acc, r.level),
          "good",
        )
      : null;
  return { readings, worst };
}

function buildWarnings(args: {
  locks: readonly DoorLock[];
  offlineDevices: readonly Device[];
  airQualityReadings: readonly AirQualityReading[];
  devices: readonly Device[];
  vacuum: Vacuum | null;
}): DashboardWarning[] {
  const warnings: DashboardWarning[] = [];

  for (const lock of args.locks) {
    if (lock.state.status === "jammed") {
      warnings.push({
        kind: "lockJammed",
        name: lock.name,
        severity: "critical",
      });
    }
  }
  for (const device of args.offlineDevices) {
    warnings.push({
      kind: "offlineDevice",
      name: device.name,
      severity: "warning",
    });
  }
  for (const reading of args.airQualityReadings) {
    if (reading.level === "poor") {
      warnings.push({
        kind: "airQualityPoor",
        name: reading.name,
        co2Ppm: reading.co2Ppm,
        severity: "warning",
      });
    }
  }
  for (const device of args.devices) {
    if (hasLowBattery(device)) {
      warnings.push({
        kind: "lowBattery",
        name: device.name,
        pct: device.battery?.pct ?? 0,
        severity: "warning",
      });
    }
  }
  if (args.vacuum && args.vacuum.state.activity === "stuck") {
    warnings.push({
      kind: "vacuumStuck",
      name: args.vacuum.name,
      severity: "warning",
    });
  }

  // Kritiske øverst.
  return warnings.sort((a, b) =>
    a.severity === b.severity ? 0 : a.severity === "critical" ? -1 : 1,
  );
}

/* ------------------------------ Statuslinjer --------------------------------- */

export type HomeStatusSeverity = "critical" | "warning" | "info" | "good";

export type HomeStatusItem =
  | {
      kind: "lock";
      severity: HomeStatusSeverity;
      locked: boolean;
      jammed: boolean;
    }
  | { kind: "openings"; severity: HomeStatusSeverity; count: number }
  | { kind: "offline"; severity: HomeStatusSeverity; count: number }
  | { kind: "airQuality"; severity: HomeStatusSeverity; level: AirQualityLevel }
  | { kind: "lightsOn"; severity: HomeStatusSeverity; count: number }
  | {
      kind: "vacuum";
      severity: HomeStatusSeverity;
      activity: Vacuum["state"]["activity"];
    };

const severityRank: Record<HomeStatusSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  good: 3,
};

/**
 * Uddrager de vigtigste statuslinjer til topområdet, sorteret med det mest
 * kritiske først (svar på "er hjemmet sikkert?" før "hvad er tændt?").
 */
export function buildStatusItems(summary: HomeSummary): HomeStatusItem[] {
  const items: HomeStatusItem[] = [];

  if (summary.security.hasLock) {
    items.push({
      kind: "lock",
      locked: summary.security.allLocked,
      jammed: summary.security.anyJammed,
      severity: summary.security.anyJammed
        ? "critical"
        : summary.security.allLocked
          ? "good"
          : "warning",
    });
  }

  const openCount = summary.security.openOpenings.length;
  items.push({
    kind: "openings",
    count: openCount,
    severity: openCount === 0 ? "good" : "warning",
  });

  if (summary.offlineDevices.length > 0) {
    items.push({
      kind: "offline",
      count: summary.offlineDevices.length,
      severity: "warning",
    });
  }

  if (summary.airQuality.worst !== null) {
    items.push({
      kind: "airQuality",
      level: summary.airQuality.worst,
      severity:
        summary.airQuality.worst === "poor"
          ? "warning"
          : summary.airQuality.worst === "moderate"
            ? "info"
            : "good",
    });
  }

  items.push({
    kind: "lightsOn",
    count: summary.activeLightCount,
    severity: "info",
  });

  if (summary.vacuum && summary.vacuum.state.activity !== "docked") {
    items.push({
      kind: "vacuum",
      activity: summary.vacuum.state.activity,
      severity: summary.vacuum.state.activity === "stuck" ? "warning" : "info",
    });
  }

  return items.sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity],
  );
}
