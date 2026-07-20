/**
 * Brandede id-typer: forhindrer at et RoomId bruges som EntityId osv.
 * (DATA_MODEL §2 – stabile app-id'er, uafhængige af Home Assistant).
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

export type HomeId = Brand<string, "HomeId">;
export type FloorId = Brand<string, "FloorId">;
export type RoomId = Brand<string, "RoomId">;
export type AreaId = Brand<string, "AreaId">;
export type DeviceId = Brand<string, "DeviceId">;
export type EntityId = Brand<string, "EntityId">;
export type SceneId = Brand<string, "SceneId">;
export type AutomationId = Brand<string, "AutomationId">;
export type MemberId = Brand<string, "MemberId">;
export type NotificationId = Brand<string, "NotificationId">;
export type BabyEventId = Brand<string, "BabyEventId">;

export const homeId = (v: string): HomeId => v as HomeId;
export const floorId = (v: string): FloorId => v as FloorId;
export const roomId = (v: string): RoomId => v as RoomId;
export const areaId = (v: string): AreaId => v as AreaId;
export const deviceId = (v: string): DeviceId => v as DeviceId;
export const entityId = (v: string): EntityId => v as EntityId;
export const sceneId = (v: string): SceneId => v as SceneId;
export const automationId = (v: string): AutomationId => v as AutomationId;
export const memberId = (v: string): MemberId => v as MemberId;
export const notificationId = (v: string): NotificationId =>
  v as NotificationId;
export const babyEventId = (v: string): BabyEventId => v as BabyEventId;
