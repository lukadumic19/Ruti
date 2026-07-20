import type { DeviceId, EntityId, RoomId } from "./ids";

/**
 * Device = den fysiske enhed (som i Home Assistants device registry).
 * Én fysisk enhed kan eksponere flere entiteter – fx eksponerer en Hue
 * Motion Sensor både bevægelse, temperatur og lysniveau.
 */
export interface Device {
  id: DeviceId;
  name: string;
  manufacturer: string;
  model: string;
  roomId: RoomId | null;
  connectivity: "online" | "offline";
  /** null for strømforsynede enheder. */
  battery: DeviceBattery | null;
  entityIds: readonly EntityId[];
}

export interface DeviceBattery {
  pct: number;
  charging: boolean;
}

export const LOW_BATTERY_THRESHOLD_PCT = 20;

export function hasLowBattery(device: Device): boolean {
  return (
    device.battery !== null &&
    !device.battery.charging &&
    device.battery.pct <= LOW_BATTERY_THRESHOLD_PCT
  );
}

export type BulbType = "gu10" | "e27" | "e14";
