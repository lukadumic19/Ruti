import type { BulbType } from "./devices";
import type { DeviceId, EntityId, RoomId } from "./ids";

/**
 * Entity = en styr- eller aflæsbar funktion i hjemmet.
 * Diskrimineret union på `kind` – ALDRIG én stor type med valgfrie felter
 * (DATA_MODEL §3). Capabilities styrer hvilke kontroller UI'et viser.
 */
interface EntityBase {
  id: EntityId;
  name: string;
  roomId: RoomId | null;
  /** Den fysiske enhed bag entiteten (null for virtuelle, fx grupper). */
  deviceId: DeviceId | null;
  availability: "available" | "unavailable";
  /** ISO 8601 – hvornår tilstanden sidst ændrede sig. */
  lastUpdated: string;
}

/* ------------------------------ Lys ------------------------------ */

export type RgbColor = readonly [number, number, number];

export interface LightCapabilities {
  dim: boolean;
  /** null = fast farvetemperatur. */
  colorTemp: { minK: number; maxK: number } | null;
  color: boolean;
}

export interface LightState {
  on: boolean;
  /** 1–100; null når pæren ikke kan dæmpes. */
  brightnessPct: number | null;
  colorTempK: number | null;
  colorRgb: RgbColor | null;
}

export interface Light extends EntityBase {
  kind: "light";
  bulb: BulbType;
  capabilities: LightCapabilities;
  state: LightState;
}

export interface LightGroup extends EntityBase {
  kind: "lightGroup";
  memberIds: readonly EntityId[];
  /** Fællesnævneren af medlemmernes capabilities. */
  capabilities: LightCapabilities;
  state: LightGroupState;
}

export interface LightGroupState {
  /** true hvis mindst ét medlem er tændt. */
  on: boolean;
  /** Gennemsnit af tændte, dæmpbare medlemmer; null hvis ingen. */
  brightnessPct: number | null;
}

/* ---------------------------- Sensorer ---------------------------- */

export type SensorMetric = "temperature" | "humidity" | "illuminance";

export interface Sensor extends EntityBase {
  kind: "sensor";
  metric: SensorMetric;
  unit: "°C" | "%" | "lx";
  state: { value: number | null };
}

export interface DoorWindowSensor extends EntityBase {
  kind: "doorWindow";
  openingType: "door" | "window";
  state: { open: boolean; openSince: string | null };
}

export interface MotionSensor extends EntityBase {
  kind: "motion";
  state: { motion: boolean; lastMotionAt: string | null };
}

/** Binære sensorer under ét (åbning + bevægelse). */
export type BinarySensor = DoorWindowSensor | MotionSensor;

export interface AirQualitySensor extends EntityBase {
  kind: "airQuality";
  state: { co2Ppm: number | null; pm25: number | null };
}

/* ----------------------------- Klima ------------------------------ */

export interface Thermostat extends EntityBase {
  kind: "thermostat";
  capabilities: { minC: number; maxC: number; stepC: number };
  state: { currentC: number; targetC: number; heating: boolean };
}

/** Klimastyring under ét – p.t. kun termostater; AC kan tilføjes som ny gren. */
export type ClimateDevice = Thermostat;

/* --------------------------- Sikkerhed ---------------------------- */

export type LockStatus =
  "locked" | "unlocked" | "locking" | "unlocking" | "jammed";

export interface DoorLock extends EntityBase {
  kind: "lock";
  state: { status: LockStatus };
}

/* ----------------------------- Øvrige ----------------------------- */

export type VacuumActivity =
  "docked" | "cleaning" | "returning" | "paused" | "stuck" | "error";

export interface Vacuum extends EntityBase {
  kind: "vacuum";
  state: { activity: VacuumActivity; batteryPct: number };
}

export interface EnergyMeter extends EntityBase {
  kind: "energyMeter";
  scope: "home" | "device";
  state: { powerW: number | null; todayKwh: number | null };
}

/* ------------------------------ Union ----------------------------- */

export type Entity =
  | Light
  | LightGroup
  | Sensor
  | DoorWindowSensor
  | MotionSensor
  | AirQualitySensor
  | Thermostat
  | DoorLock
  | Vacuum
  | EnergyMeter;

export type EntityKind = Entity["kind"];

export type EntityOfKind<K extends EntityKind> = Extract<Entity, { kind: K }>;

export function isEntityOfKind<K extends EntityKind>(
  entity: Entity,
  kind: K,
): entity is EntityOfKind<K> {
  return entity.kind === kind;
}

/* --------------------------- Capabilities ------------------------- */

/** Flad capability-liste – bruges af UI til at vælge kontroller. */
export type DeviceCapability =
  | "onOff"
  | "dim"
  | "colorTemperature"
  | "color"
  | "targetTemperature"
  | "lockControl"
  | "vacuumControl"
  | "openClose"
  | "motion"
  | "airQuality"
  | "energy"
  | "measurement";

export function capabilitiesOf(entity: Entity): readonly DeviceCapability[] {
  switch (entity.kind) {
    case "light":
    case "lightGroup": {
      const caps: DeviceCapability[] = ["onOff"];
      if (entity.capabilities.dim) caps.push("dim");
      if (entity.capabilities.colorTemp) caps.push("colorTemperature");
      if (entity.capabilities.color) caps.push("color");
      return caps;
    }
    case "sensor":
      return ["measurement"];
    case "doorWindow":
      return ["openClose"];
    case "motion":
      return ["motion"];
    case "airQuality":
      return ["airQuality"];
    case "thermostat":
      return ["targetTemperature", "measurement"];
    case "lock":
      return ["lockControl"];
    case "vacuum":
      return ["vacuumControl"];
    case "energyMeter":
      return ["energy"];
  }
}
