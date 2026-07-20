import type { Automation } from "./automations";
import type { BabyEvent } from "./baby";
import type { ConnectionStatus } from "./connection";
import type { Device } from "./devices";
import type { Entity } from "./entities";
import type { Area, Floor, Home, HouseholdMember, Room } from "./home";
import type { Notification } from "./notifications";
import type { Scene } from "./scenes";

/** Events fra en HomeProvider til UI-laget (TECHNICAL_ARCHITECTURE §4). */
export type HomeEvent =
  | { type: "entity"; entity: Entity }
  | { type: "device"; device: Device }
  | { type: "connection"; status: ConnectionStatus }
  | { type: "notification"; notification: Notification }
  | { type: "scene"; scene: Scene }
  /** Fuldt snapshot bør genindlæses (fx efter genforbindelse). */
  | { type: "resync" };

/** Komplet øjebliksbillede af hjemmet. */
export interface HomeSnapshot {
  home: Home;
  floors: readonly Floor[];
  rooms: readonly Room[];
  areas: readonly Area[];
  devices: readonly Device[];
  entities: readonly Entity[];
  scenes: readonly Scene[];
  automations: readonly Automation[];
  members: readonly HouseholdMember[];
  babyEvents: readonly BabyEvent[];
}
