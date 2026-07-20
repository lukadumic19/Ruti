import type { RgbColor } from "./entities";
import type { EntityId } from "./ids";

/**
 * ServiceCall = en typet kommando mod en entitet. Lukket sæt – ukendte
 * kommandoer kan ikke udtrykkes (SECURITY_MODEL §4: kommando-whitelist).
 */
export type ServiceCall =
  | {
      service: "light.turnOn";
      entityId: EntityId;
      brightnessPct?: number;
      colorTempK?: number;
      colorRgb?: RgbColor;
    }
  | { service: "light.turnOff"; entityId: EntityId }
  | { service: "lock.lock"; entityId: EntityId }
  | { service: "lock.unlock"; entityId: EntityId }
  | {
      service: "climate.setTargetTemperature";
      entityId: EntityId;
      targetC: number;
    }
  | {
      service: "vacuum.setActivity";
      entityId: EntityId;
      action: "start" | "pause" | "dock";
    };

export type ServiceName = ServiceCall["service"];

export type ProviderErrorCode =
  | "NOT_CONNECTED"
  | "ENTITY_NOT_FOUND"
  | "DEVICE_UNAVAILABLE"
  | "UNSUPPORTED_CAPABILITY"
  | "INVALID_ARGUMENT"
  | "LOCK_JAMMED"
  | "TIMEOUT"
  | "UNKNOWN";

export interface ServiceResult {
  ok: boolean;
  error?: ProviderErrorCode;
}

export interface SceneStepResult {
  /** Menneskelæsbar etiket, fx "Bordlampe → sluk". */
  label: string;
  ok: boolean;
  error?: ProviderErrorCode;
}

export interface SceneExecutionResult {
  ok: boolean;
  error?: ProviderErrorCode;
  steps: readonly SceneStepResult[];
}
