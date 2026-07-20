import type { HomeProvider, Unsubscribe } from "@/lib/ha/provider";
import type {
  ConnectionStatus,
  Device,
  DeviceId,
  Entity,
  EntityId,
  HomeEvent,
  HomeSnapshot,
  Light,
  LightGroup,
  Notification,
  ProviderErrorCode,
  Scene,
  SceneExecutionResult,
  SceneId,
  SceneStepResult,
  ServiceCall,
  ServiceResult,
} from "@/types";
import { notificationId } from "@/types";

import { createRng, range, type Rng } from "./rng";
import { buildMockHome, type MockHomeData } from "./seed";

export interface MockProviderOptions {
  /** RNG-seed – samme seed giver samme simulering. */
  seed?: number;
  /** Basis-latenstid for kommandoer (jitter lægges oveni). */
  commandLatencyMs?: number;
  /** Simulator-interval; 0 slår simulatoren fra. */
  tickIntervalMs?: number;
  /** Tid fra connect() til "connected". */
  connectDelayMs?: number;
  /** Varighed af låse-/oplåsningsbevægelsen. */
  lockTransitionMs?: number;
  /** Hvor længe en bevægelsesdetektion står på. */
  motionClearMs?: number;
}

/** Dev-kontrolflade til mock-kontrolpanelet – IKKE en del af HomeProvider. */
export interface MockScenarioController {
  simulateConnectionLoss(opts?: { reconnectAfterMs: number | null }): void;
  restoreConnection(): void;
  setDeviceConnectivity(id: DeviceId, online: boolean): void;
  setBattery(id: DeviceId, pct: number): void;
  setOpening(id: EntityId, open: boolean): void;
  triggerMotion(id: EntityId): void;
  setAirQuality(id: EntityId, values: { co2Ppm?: number; pm25?: number }): void;
  setLockJammed(id: EntityId, jammed: boolean): void;
  setCommandLatency(ms: number): void;
}

const err = (error: ProviderErrorCode): ServiceResult => ({ ok: false, error });
const OK: ServiceResult = { ok: true };

/**
 * Fuldt fungerende mock-implementering af HomeProvider (TEST_STRATEGY §3).
 * Kører rent i hukommelsen: realtidsagtige events, kommandolatens, simulator
 * med deterministisk RNG samt scenariestyring til fejl-/offline-tilstande.
 */
export class MockHomeProvider implements HomeProvider, MockScenarioController {
  private data: MockHomeData;
  private entities = new Map<EntityId, Entity>();
  private devices = new Map<DeviceId, Device>();
  private scenes = new Map<SceneId, Scene>();
  private listeners = new Set<(event: HomeEvent) => void>();
  private status: ConnectionStatus;
  private rng: Rng;
  private latencyMs: number;
  private readonly opts: Required<MockProviderOptions>;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();
  private notificationCounter = 0;

  constructor(options: MockProviderOptions = {}) {
    this.opts = {
      seed: options.seed ?? 20260720,
      commandLatencyMs: options.commandLatencyMs ?? 150,
      tickIntervalMs: options.tickIntervalMs ?? 5000,
      connectDelayMs: options.connectDelayMs ?? 400,
      lockTransitionMs: options.lockTransitionMs ?? 1200,
      motionClearMs: options.motionClearMs ?? 15_000,
    };
    this.rng = createRng(this.opts.seed);
    this.latencyMs = this.opts.commandLatencyMs;
    this.data = buildMockHome();
    for (const entity of this.data.entities)
      this.entities.set(entity.id, entity);
    for (const device of this.data.devices) this.devices.set(device.id, device);
    for (const scene of this.data.scenes) this.scenes.set(scene.id, scene);
    this.status = this.makeStatus("disconnected");
  }

  /* ------------------------------ Livscyklus ----------------------------- */

  async connect(): Promise<void> {
    if (this.status.state === "connected") return;
    this.setStatus("connecting");
    await this.delay(this.opts.connectDelayMs);
    this.setStatus("connected");
    this.startSimulator();
  }

  async disconnect(): Promise<void> {
    this.stopSimulator();
    for (const t of this.pendingTimeouts) clearTimeout(t);
    this.pendingTimeouts.clear();
    this.setStatus("disconnected");
  }

  getConnectionStatus(): ConnectionStatus {
    return this.status;
  }

  subscribe(listener: (event: HomeEvent) => void): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /* -------------------------------- Læsning ------------------------------ */

  async getSnapshot(): Promise<HomeSnapshot> {
    return {
      home: this.data.home,
      floors: this.data.floors,
      rooms: this.data.rooms,
      areas: this.data.areas,
      devices: [...this.devices.values()],
      entities: [...this.entities.values()],
      scenes: [...this.scenes.values()],
      automations: this.data.automations,
      members: this.data.members,
      babyEvents: this.data.babyEvents,
    };
  }

  async getEntities(): Promise<readonly Entity[]> {
    return [...this.entities.values()];
  }

  async getEntity(id: EntityId): Promise<Entity | undefined> {
    return this.entities.get(id);
  }

  /* ------------------------------ Kommandoer ----------------------------- */

  async callService(call: ServiceCall): Promise<ServiceResult> {
    if (this.status.state !== "connected") return err("NOT_CONNECTED");
    const entity = this.entities.get(call.entityId);
    if (!entity) return err("ENTITY_NOT_FOUND");
    if (entity.availability === "unavailable") return err("DEVICE_UNAVAILABLE");

    await this.delay(this.latencyMs + range(this.rng, 0, this.latencyMs / 2));
    // Forbindelsen kan være røget, mens kommandoen var undervejs.
    if (this.status.state !== "connected") return err("NOT_CONNECTED");

    switch (call.service) {
      case "light.turnOn":
      case "light.turnOff":
        return this.applyLightCall(entity, call);
      case "lock.lock":
      case "lock.unlock":
        return this.applyLockCall(entity, call.service === "lock.lock");
      case "climate.setTargetTemperature":
        return this.applyClimateCall(entity, call.targetC);
      case "vacuum.setActivity":
        return this.applyVacuumCall(entity, call.action);
    }
  }

  async executeScene(id: SceneId): Promise<SceneExecutionResult> {
    if (this.status.state !== "connected")
      return { ok: false, error: "NOT_CONNECTED", steps: [] };
    const scene = this.scenes.get(id);
    if (!scene) return { ok: false, error: "ENTITY_NOT_FOUND", steps: [] };

    const steps: SceneStepResult[] = [];
    for (const action of scene.actions) {
      const target = this.entities.get(action.entityId);
      const label = `${target?.name ?? action.entityId} → ${action.service}`;
      const result = await this.callService(action);
      steps.push(
        result.ok
          ? { label, ok: true }
          : { label, ok: false, error: result.error ?? "UNKNOWN" },
      );
    }

    if (scene.sceneType === "mode") {
      const updated: Scene = { ...scene, active: !scene.active };
      this.scenes.set(id, updated);
      this.emit({ type: "scene", scene: updated });
    }

    const ok = steps.every((s) => s.ok);
    return ok ? { ok, steps } : { ok, error: "UNKNOWN", steps };
  }

  /* --------------------- Scenariestyring (dev-panel) --------------------- */

  simulateConnectionLoss(opts?: { reconnectAfterMs: number | null }): void {
    const reconnectAfterMs = opts?.reconnectAfterMs ?? 4000;
    this.stopSimulator();
    this.setStatus("offline");
    if (reconnectAfterMs !== null) {
      this.after(reconnectAfterMs, () => this.restoreConnection());
    }
  }

  restoreConnection(): void {
    if (this.status.state === "connected") return;
    this.setStatus("reconnecting");
    this.after(800, () => {
      this.setStatus("connected");
      this.startSimulator();
      this.emit({ type: "resync" });
    });
  }

  setDeviceConnectivity(id: DeviceId, online: boolean): void {
    const device = this.devices.get(id);
    if (!device) return;
    const updated: Device = {
      ...device,
      connectivity: online ? "online" : "offline",
    };
    this.devices.set(id, updated);
    this.emit({ type: "device", device: updated });
    for (const entityIdRef of device.entityIds) {
      const entity = this.entities.get(entityIdRef);
      if (!entity) continue;
      this.setEntity({
        ...entity,
        availability: online ? "available" : "unavailable",
      } as Entity);
    }
  }

  setBattery(id: DeviceId, pct: number): void {
    const device = this.devices.get(id);
    if (!device || !device.battery) return;
    const clamped = Math.min(100, Math.max(0, Math.round(pct)));
    const updated: Device = {
      ...device,
      battery: { ...device.battery, pct: clamped },
    };
    this.devices.set(id, updated);
    this.emit({ type: "device", device: updated });
    if (clamped <= 20) {
      this.notify(
        "warning",
        "Lavt batteri",
        `${device.name} er på ${clamped} %.`,
      );
    }
  }

  setOpening(id: EntityId, open: boolean): void {
    const entity = this.entities.get(id);
    if (!entity || entity.kind !== "doorWindow") return;
    if (entity.state.open === open) return;
    this.setEntity({
      ...entity,
      state: { open, openSince: open ? this.nowIso() : null },
    });
  }

  triggerMotion(id: EntityId): void {
    const entity = this.entities.get(id);
    if (!entity || entity.kind !== "motion") return;
    this.setEntity({
      ...entity,
      state: { motion: true, lastMotionAt: this.nowIso() },
    });
    this.after(this.opts.motionClearMs, () => {
      const current = this.entities.get(id);
      if (!current || current.kind !== "motion" || !current.state.motion)
        return;
      this.setEntity({
        ...current,
        state: { ...current.state, motion: false },
      });
    });
  }

  setAirQuality(
    id: EntityId,
    values: { co2Ppm?: number; pm25?: number },
  ): void {
    const entity = this.entities.get(id);
    if (!entity || entity.kind !== "airQuality") return;
    this.setEntity({
      ...entity,
      state: {
        co2Ppm: values.co2Ppm ?? entity.state.co2Ppm,
        pm25: values.pm25 ?? entity.state.pm25,
      },
    });
  }

  setLockJammed(id: EntityId, jammed: boolean): void {
    const entity = this.entities.get(id);
    if (!entity || entity.kind !== "lock") return;
    this.setEntity({
      ...entity,
      state: { status: jammed ? "jammed" : "locked" },
    });
    if (jammed) {
      this.notify(
        "critical",
        "Låsen svarer ikke",
        `${entity.name} sidder fast – tjek om døren er lukket helt.`,
      );
    }
  }

  setCommandLatency(ms: number): void {
    this.latencyMs = Math.max(0, ms);
  }

  /* ---------------------------- Kommandologik ---------------------------- */

  private applyLightCall(
    entity: Entity,
    call: Extract<ServiceCall, { service: "light.turnOn" | "light.turnOff" }>,
  ): ServiceResult {
    if (entity.kind === "light") {
      const result = this.applySingleLight(entity, call);
      if (result.ok) this.refreshGroupsContaining(entity.id);
      return result;
    }
    if (entity.kind === "lightGroup") {
      let anyApplied = false;
      for (const memberId of entity.memberIds) {
        const member = this.entities.get(memberId);
        if (!member || member.kind !== "light") continue;
        if (member.availability === "unavailable") continue;
        const result = this.applySingleLight(member, call);
        if (result.ok) anyApplied = true;
      }
      if (!anyApplied) return err("DEVICE_UNAVAILABLE");
      this.refreshGroup(entity.id);
      return OK;
    }
    return err("UNSUPPORTED_CAPABILITY");
  }

  private applySingleLight(
    light: Light,
    call: Extract<ServiceCall, { service: "light.turnOn" | "light.turnOff" }>,
  ): ServiceResult {
    if (call.service === "light.turnOff") {
      this.setEntity({ ...light, state: { ...light.state, on: false } });
      return OK;
    }
    if (call.brightnessPct !== undefined && !light.capabilities.dim)
      return err("UNSUPPORTED_CAPABILITY");
    if (call.colorTempK !== undefined && !light.capabilities.colorTemp)
      return err("UNSUPPORTED_CAPABILITY");
    if (call.colorRgb !== undefined && !light.capabilities.color)
      return err("UNSUPPORTED_CAPABILITY");
    if (
      call.brightnessPct !== undefined &&
      (call.brightnessPct < 1 || call.brightnessPct > 100)
    )
      return err("INVALID_ARGUMENT");

    const ct = light.capabilities.colorTemp;
    const colorTempK =
      call.colorTempK !== undefined && ct
        ? Math.min(ct.maxK, Math.max(ct.minK, call.colorTempK))
        : light.state.colorTempK;

    this.setEntity({
      ...light,
      state: {
        on: true,
        brightnessPct:
          call.brightnessPct !== undefined
            ? Math.round(call.brightnessPct)
            : light.state.brightnessPct,
        colorTempK: call.colorRgb !== undefined ? null : colorTempK,
        colorRgb:
          call.colorRgb ??
          (call.colorTempK !== undefined ? null : light.state.colorRgb),
      },
    });
    return OK;
  }

  private applyLockCall(entity: Entity, lock: boolean): ServiceResult {
    if (entity.kind !== "lock") return err("UNSUPPORTED_CAPABILITY");
    if (entity.state.status === "jammed") return err("LOCK_JAMMED");
    this.setEntity({
      ...entity,
      state: { status: lock ? "locking" : "unlocking" },
    });
    this.after(this.opts.lockTransitionMs, () => {
      const current = this.entities.get(entity.id);
      if (!current || current.kind !== "lock") return;
      if (
        current.state.status !== "locking" &&
        current.state.status !== "unlocking"
      )
        return;
      this.setEntity({
        ...current,
        state: { status: lock ? "locked" : "unlocked" },
      });
    });
    return OK;
  }

  private applyClimateCall(entity: Entity, targetC: number): ServiceResult {
    if (entity.kind !== "thermostat") return err("UNSUPPORTED_CAPABILITY");
    const { minC, maxC } = entity.capabilities;
    if (Number.isNaN(targetC)) return err("INVALID_ARGUMENT");
    const clamped = Math.min(maxC, Math.max(minC, targetC));
    this.setEntity({
      ...entity,
      state: {
        ...entity.state,
        targetC: clamped,
        heating: clamped > entity.state.currentC,
      },
    });
    return OK;
  }

  private applyVacuumCall(
    entity: Entity,
    action: "start" | "pause" | "dock",
  ): ServiceResult {
    if (entity.kind !== "vacuum") return err("UNSUPPORTED_CAPABILITY");
    if (entity.state.activity === "stuck" && action !== "dock")
      return err("UNKNOWN");
    const activity =
      action === "start"
        ? "cleaning"
        : action === "pause"
          ? "paused"
          : "returning";
    this.setEntity({ ...entity, state: { ...entity.state, activity } });
    if (action === "dock") {
      this.after(5000, () => {
        const current = this.entities.get(entity.id);
        if (!current || current.kind !== "vacuum") return;
        if (current.state.activity !== "returning") return;
        this.setEntity({
          ...current,
          state: { ...current.state, activity: "docked" },
        });
      });
    }
    return OK;
  }

  /* ------------------------------ Grupper -------------------------------- */

  private refreshGroupsContaining(lightId: EntityId): void {
    for (const entity of this.entities.values()) {
      if (entity.kind === "lightGroup" && entity.memberIds.includes(lightId)) {
        this.refreshGroup(entity.id);
      }
    }
  }

  private refreshGroup(groupId: EntityId): void {
    const group = this.entities.get(groupId);
    if (!group || group.kind !== "lightGroup") return;
    const members = group.memberIds
      .map((id) => this.entities.get(id))
      .filter((e): e is Light => e !== undefined && e.kind === "light");
    const onMembers = members.filter((m) => m.state.on);
    const dimValues = onMembers
      .map((m) => m.state.brightnessPct)
      .filter((v): v is number => v !== null);
    const next: LightGroup = {
      ...group,
      state: {
        on: onMembers.length > 0,
        brightnessPct:
          dimValues.length > 0
            ? Math.round(
                dimValues.reduce((a, b) => a + b, 0) / dimValues.length,
              )
            : null,
      },
    };
    this.setEntity(next);
  }

  /* ------------------------------ Simulator ------------------------------ */

  private startSimulator(): void {
    if (this.tickTimer || this.opts.tickIntervalMs <= 0) return;
    this.tickTimer = setInterval(() => this.tick(), this.opts.tickIntervalMs);
  }

  private stopSimulator(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  /** Ét simulator-tick: små, realistiske ændringer i sensorer og enheder. */
  private tick(): void {
    for (const entity of this.entities.values()) {
      if (entity.availability === "unavailable") continue;
      switch (entity.kind) {
        case "sensor": {
          if (entity.state.value === null) break;
          const drift =
            entity.metric === "temperature"
              ? range(this.rng, -0.15, 0.15)
              : entity.metric === "humidity"
                ? range(this.rng, -0.8, 0.8)
                : range(this.rng, -3, 3);
          const decimals = entity.metric === "temperature" ? 1 : 0;
          const next = Number((entity.state.value + drift).toFixed(decimals));
          if (next !== entity.state.value) {
            this.setEntity({ ...entity, state: { value: next } });
          }
          break;
        }
        case "energyMeter": {
          if (entity.state.powerW === null) break;
          const powerW = Math.max(
            80,
            Math.round(entity.state.powerW + range(this.rng, -60, 60)),
          );
          const todayKwh =
            entity.state.todayKwh === null
              ? null
              : Number(
                  (
                    entity.state.todayKwh +
                    (powerW * this.opts.tickIntervalMs) / 3_600_000 / 1000
                  ).toFixed(3),
                );
          this.setEntity({ ...entity, state: { powerW, todayKwh } });
          break;
        }
        case "vacuum": {
          if (entity.state.activity === "cleaning") {
            const batteryPct = Math.max(5, entity.state.batteryPct - 1);
            this.setEntity({
              ...entity,
              state: { ...entity.state, batteryPct },
            });
          }
          break;
        }
        case "thermostat": {
          // Rumtemperaturen bevæger sig langsomt mod måltemperaturen.
          const delta = entity.state.targetC - entity.state.currentC;
          if (Math.abs(delta) > 0.05) {
            const currentC = Number(
              (entity.state.currentC + Math.sign(delta) * 0.1).toFixed(1),
            );
            this.setEntity({
              ...entity,
              state: {
                ...entity.state,
                currentC,
                heating: entity.state.targetC > currentC,
              },
            });
          }
          break;
        }
        default:
          break;
      }
    }
  }

  /* -------------------------------- Intern ------------------------------- */

  private setEntity(entity: Entity): void {
    const stamped = { ...entity, lastUpdated: this.nowIso() } as Entity;
    this.entities.set(entity.id, stamped);
    this.emit({ type: "entity", entity: stamped });
  }

  private makeStatus(state: ConnectionStatus["state"]): ConnectionStatus {
    return { state, source: "mock", since: this.nowIso() };
  }

  private setStatus(state: ConnectionStatus["state"]): void {
    if (this.status.state === state) return;
    this.status = this.makeStatus(state);
    this.emit({ type: "connection", status: this.status });
  }

  private notify(
    severity: Notification["severity"],
    title: string,
    body: string,
  ): void {
    this.notificationCounter += 1;
    const notification: Notification = {
      id: notificationId(`notification.${this.notificationCounter}`),
      at: this.nowIso(),
      severity,
      title,
      body,
      read: false,
    };
    this.emit({ type: "notification", notification });
  }

  private emit(event: HomeEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // En defekt lytter må aldrig vælte provideren.
      }
    }
  }

  private nowIso(): string {
    return new Date().toISOString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        this.pendingTimeouts.delete(t);
        resolve();
      }, ms);
      this.pendingTimeouts.add(t);
    });
  }

  private after(ms: number, fn: () => void): void {
    const t = setTimeout(() => {
      this.pendingTimeouts.delete(t);
      fn();
    }, ms);
    this.pendingTimeouts.add(t);
  }
}
