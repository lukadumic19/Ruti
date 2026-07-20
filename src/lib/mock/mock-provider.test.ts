import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HomeEvent } from "@/types";
import { sceneId } from "@/types";

import { MockHomeProvider } from "./mock-provider";
import { DEVICE_IDS, IDS } from "./seed";

/**
 * Fake timers styrer al latenstid og simulator-ticks, så testene er
 * deterministiske (TEST_STRATEGY §3).
 */
describe("MockHomeProvider", () => {
  let provider: MockHomeProvider;
  let events: HomeEvent[];

  beforeEach(async () => {
    vi.useFakeTimers();
    provider = new MockHomeProvider({
      commandLatencyMs: 100,
      tickIntervalMs: 1000,
      connectDelayMs: 10,
      lockTransitionMs: 500,
      motionClearMs: 2000,
    });
    events = [];
    provider.subscribe((e) => events.push(e));
    const connecting = provider.connect();
    await vi.advanceTimersByTimeAsync(20);
    await connecting;
  });

  afterEach(async () => {
    await provider.disconnect();
    vi.useRealTimers();
  });

  /** Kør et service-kald til ende under fake timers (inkl. låse-transition). */
  async function call(...args: Parameters<MockHomeProvider["callService"]>) {
    const promise = provider.callService(...args);
    await vi.advanceTimersByTimeAsync(1000);
    return promise;
  }

  it("forbinder og leverer et komplet snapshot", async () => {
    expect(provider.getConnectionStatus().state).toBe("connected");
    const snapshot = await provider.getSnapshot();
    expect(snapshot.rooms).toHaveLength(7);
    expect(snapshot.entities.length).toBeGreaterThan(30);
    expect(snapshot.scenes).toHaveLength(10);
  });

  it("tænder lys med lysstyrke og udsender entity-event", async () => {
    const result = await call({
      service: "light.turnOn",
      entityId: IDS.vaeglampe,
      brightnessPct: 30,
    });
    expect(result).toEqual({ ok: true });
    const entity = await provider.getEntity(IDS.vaeglampe);
    expect(entity?.kind === "light" && entity.state).toEqual({
      on: true,
      brightnessPct: 30,
      colorTempK: null,
      colorRgb: null,
    });
    expect(
      events.some((e) => e.type === "entity" && e.entity.id === IDS.vaeglampe),
    ).toBe(true);
  });

  it("afviser capabilities pæren ikke har", async () => {
    // Væglampen (E14) kan hverken farve eller farvetemperatur
    const color = await call({
      service: "light.turnOn",
      entityId: IDS.vaeglampe,
      colorRgb: [255, 0, 0],
    });
    expect(color).toEqual({ ok: false, error: "UNSUPPORTED_CAPABILITY" });
    const ct = await call({
      service: "light.turnOn",
      entityId: IDS.vaeglampe,
      colorTempK: 4000,
    });
    expect(ct).toEqual({ ok: false, error: "UNSUPPORTED_CAPABILITY" });
  });

  it("gruppekommandoer rammer alle medlemmer og opdaterer gruppens tilstand", async () => {
    const result = await call({
      service: "light.turnOn",
      entityId: IDS.gruppeSpisebord,
      brightnessPct: 50,
    });
    expect(result.ok).toBe(true);
    const member = await provider.getEntity(IDS.spisebord3);
    expect(member?.kind === "light" && member.state.on).toBe(true);
    const group = await provider.getEntity(IDS.gruppeSpisebord);
    expect(group?.kind === "lightGroup" && group.state).toEqual({
      on: true,
      brightnessPct: 50,
    });
  });

  it("enkelt lys opdaterer sine gruppers aggregerede tilstand", async () => {
    await call({ service: "light.turnOn", entityId: IDS.spotKokken1 });
    const group = await provider.getEntity(IDS.gruppeKokken);
    expect(group?.kind === "lightGroup" && group.state.on).toBe(true);
  });

  it("lås gennemgår locking → locked med events", async () => {
    await call({ service: "lock.unlock", entityId: IDS.laasHoveddor });
    let lock = await provider.getEntity(IDS.laasHoveddor);
    expect(lock?.kind === "lock" && lock.state.status).toBe("unlocked");

    const promise = provider.callService({
      service: "lock.lock",
      entityId: IDS.laasHoveddor,
    });
    await vi.advanceTimersByTimeAsync(200);
    await promise;
    lock = await provider.getEntity(IDS.laasHoveddor);
    expect(lock?.kind === "lock" && lock.state.status).toBe("locking");
    await vi.advanceTimersByTimeAsync(600);
    lock = await provider.getEntity(IDS.laasHoveddor);
    expect(lock?.kind === "lock" && lock.state.status).toBe("locked");
  });

  it("fastklemt lås afviser kommandoer med LOCK_JAMMED", async () => {
    provider.setLockJammed(IDS.laasHoveddor, true);
    const result = await call({
      service: "lock.unlock",
      entityId: IDS.laasHoveddor,
    });
    expect(result).toEqual({ ok: false, error: "LOCK_JAMMED" });
    expect(
      events.some(
        (e) =>
          e.type === "notification" && e.notification.severity === "critical",
      ),
    ).toBe(true);
  });

  it("termostat clamper måltemperatur til capabilities", async () => {
    const result = await call({
      service: "climate.setTargetTemperature",
      entityId: IDS.termostatStue,
      targetC: 45,
    });
    expect(result.ok).toBe(true);
    const t = await provider.getEntity(IDS.termostatStue);
    expect(t?.kind === "thermostat" && t.state.targetC).toBe(28);
  });

  it("robotstøvsugeren skifter status og bruger batteri under rengøring", async () => {
    await call({
      service: "vacuum.setActivity",
      entityId: IDS.stovsuger,
      action: "start",
    });
    let vacuum = await provider.getEntity(IDS.stovsuger);
    expect(vacuum?.kind === "vacuum" && vacuum.state.activity).toBe("cleaning");
    await vi.advanceTimersByTimeAsync(3000); // 3 simulator-ticks
    vacuum = await provider.getEntity(IDS.stovsuger);
    expect(vacuum?.kind === "vacuum" && vacuum.state.batteryPct).toBeLessThan(
      100,
    );
  });

  it("offline enhed gør entiteter utilgængelige og afviser kommandoer", async () => {
    const bordlampeDevice = (await provider.getEntity(IDS.bordlampe))?.deviceId;
    expect(bordlampeDevice).toBeTruthy();
    if (!bordlampeDevice) return;
    provider.setDeviceConnectivity(bordlampeDevice, false);
    const entity = await provider.getEntity(IDS.bordlampe);
    expect(entity?.availability).toBe("unavailable");
    const result = await call({
      service: "light.turnOff",
      entityId: IDS.bordlampe,
    });
    expect(result).toEqual({ ok: false, error: "DEVICE_UNAVAILABLE" });
  });

  it("forbindelsestab afviser kommandoer og genopretter automatisk med resync", async () => {
    provider.simulateConnectionLoss({ reconnectAfterMs: 2000 });
    expect(provider.getConnectionStatus().state).toBe("offline");
    const result = await provider.callService({
      service: "light.turnOff",
      entityId: IDS.bordlampe,
    });
    expect(result).toEqual({ ok: false, error: "NOT_CONNECTED" });

    await vi.advanceTimersByTimeAsync(2100);
    expect(provider.getConnectionStatus().state).toBe("reconnecting");
    await vi.advanceTimersByTimeAsync(1000);
    expect(provider.getConnectionStatus().state).toBe("connected");
    expect(events.some((e) => e.type === "resync")).toBe(true);
  });

  it("lavt batteri udsender device-event og notifikation", () => {
    provider.setBattery(DEVICE_IDS.dimmerSove, 12);
    const deviceEvent = events.find(
      (e) => e.type === "device" && e.device.id === DEVICE_IDS.dimmerSove,
    );
    expect(
      deviceEvent?.type === "device" && deviceEvent.device.battery?.pct,
    ).toBe(12);
    expect(
      events.some(
        (e) =>
          e.type === "notification" && e.notification.title === "Lavt batteri",
      ),
    ).toBe(true);
  });

  it("bevægelse udløses og rydder sig selv efter timeout", async () => {
    provider.triggerMotion(IDS.bevaegelseEntre);
    let motion = await provider.getEntity(IDS.bevaegelseEntre);
    expect(motion?.kind === "motion" && motion.state.motion).toBe(true);
    await vi.advanceTimersByTimeAsync(2500);
    motion = await provider.getEntity(IDS.bevaegelseEntre);
    expect(motion?.kind === "motion" && motion.state.motion).toBe(false);
    expect(
      motion?.kind === "motion" && motion.state.lastMotionAt,
    ).not.toBeNull();
  });

  it("åben dør registreres med tidsstempel", async () => {
    provider.setOpening(IDS.doerAltan, true);
    const door = await provider.getEntity(IDS.doerAltan);
    expect(door?.kind === "doorWindow" && door.state.open).toBe(true);
    expect(door?.kind === "doorWindow" && door.state.openSince).not.toBeNull();
  });

  it("scener udføres med resultat pr. trin og mode-scener toggler aktiv", async () => {
    const promise = provider.executeScene(sceneId("scene.godnat"));
    await vi.advanceTimersByTimeAsync(5000);
    const result = await promise;
    expect(result.ok).toBe(true);
    expect(result.steps).toHaveLength(3);
    expect(result.steps.every((s) => s.ok)).toBe(true);

    const babyPromise = provider.executeScene(sceneId("scene.babytilstand"));
    await vi.advanceTimersByTimeAsync(2000);
    await babyPromise;
    const scenes = (await provider.getSnapshot()).scenes;
    const baby = scenes.find((s) => s.id === sceneId("scene.babytilstand"));
    expect(baby?.active).toBe(true);
  });

  it("scener rapporterer delvise fejl når en enhed er offline", async () => {
    const bordlampeDevice = (await provider.getEntity(IDS.bordlampe))?.deviceId;
    if (!bordlampeDevice) throw new Error("mangler device");
    provider.setDeviceConnectivity(bordlampeDevice, false);

    const promise = provider.executeScene(sceneId("scene.vi-er-hjemme"));
    await vi.advanceTimersByTimeAsync(5000);
    const result = await promise;
    expect(result.ok).toBe(false);
    const failed = result.steps.filter((s) => !s.ok);
    expect(failed).toHaveLength(1);
    expect(failed[0]?.error).toBe("DEVICE_UNAVAILABLE");
  });

  it("simulatoren ændrer sensorværdier over tid", async () => {
    const before = await provider.getEntity(IDS.tempEntre);
    await vi.advanceTimersByTimeAsync(10_000);
    const after = await provider.getEntity(IDS.tempEntre);
    expect(before?.kind === "sensor" && after?.kind === "sensor").toBe(true);
    if (before?.kind === "sensor" && after?.kind === "sensor") {
      expect(after.lastUpdated).not.toBe(before.lastUpdated);
    }
  });
});
