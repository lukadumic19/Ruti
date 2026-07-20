"use client";

/**
 * Mock-kontrolpanel – udviklerside til at fremprovokere tilstande i
 * MockHomeProvider (fejl, offline, lavt batteri, åbne døre m.m.).
 * Dev-værktøj: undtaget fra i18n-beskedfilen ligesom /design-system.
 */
import * as React from "react";
import {
  DoorOpen,
  Lamp,
  Lightbulb,
  Lock,
  LockOpen,
  Moon,
  PersonStanding,
  Wind,
} from "lucide-react";
import { toast } from "sonner";

import { BatteryStatus } from "@/components/devices/battery-status";
import { DeviceCard } from "@/components/devices/device-card";
import { TemperatureDisplay } from "@/components/devices/temperature-display";
import { AlertCard } from "@/components/feedback/alert-card";
import {
  ConnectionStatus,
  type ConnectionUiState,
} from "@/components/feedback/connection-status";
import { OfflineBanner } from "@/components/feedback/offline-banner";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/states/error-state";
import { PageSkeleton } from "@/components/states/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Slider } from "@/components/ui/slider";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { useConnectionStatus, useLiveHome } from "@/features/home/hooks";
import { useHomeProviderOrNull } from "@/features/home/home-provider-context";
import { MockHomeProvider } from "@/lib/mock/mock-provider";
import { DEVICE_IDS, IDS } from "@/lib/mock/seed";
import type { ConnectionState, SceneExecutionResult } from "@/types";
import { sceneId } from "@/types";

function toUiState(state: ConnectionState): ConnectionUiState {
  switch (state) {
    case "connected":
      return "connected";
    case "connecting":
    case "reconnecting":
      return "reconnecting";
    case "offline":
    case "disconnected":
      return "offline";
  }
}

type LatencyChoice = "normal" | "slow" | "verySlow";
const latencyMs: Record<LatencyChoice, number> = {
  normal: 150,
  slow: 1000,
  verySlow: 3000,
};

export function MockPanelPage() {
  const provider = useHomeProviderOrNull();
  const status = useConnectionStatus();
  const { loading, error, entities, devices, notifications, retry } =
    useLiveHome();
  const [latency, setLatency] = React.useState<LatencyChoice>("normal");
  const [sceneResult, setSceneResult] =
    React.useState<SceneExecutionResult | null>(null);
  const [sceneBusy, setSceneBusy] = React.useState(false);

  const mock = provider instanceof MockHomeProvider ? provider : null;

  if (!provider || !mock) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Mock-kontrolpanel" />
        <AlertCard
          severity="info"
          title="Ingen mock-datakilde"
          description="Panelet kræver demo-tilstand (APP_MODE=demo). I forbundet tilstand styres hjemmet af Home Assistant."
        />
      </div>
    );
  }

  if (loading) return <PageSkeleton label="Indlæser mock-hjemmet" />;
  if (error) return <ErrorState onRetry={retry} />;

  const bordlampe = entities.get(IDS.bordlampe);
  const gruppeSpisebord = entities.get(IDS.gruppeSpisebord);
  const tempEntre = entities.get(IDS.tempEntre);
  const motion = entities.get(IDS.bevaegelseEntre);
  const co2 = entities.get(IDS.co2Boerne);
  const laas = entities.get(IDS.laasHoveddor);
  const hoveddor = entities.get(IDS.doerHoved);
  const altandor = entities.get(IDS.doerAltan);
  const vindue = entities.get(IDS.vindueSove);
  const dimmer = devices.get(DEVICE_IDS.dimmerSove);
  const bordlampeDevice =
    bordlampe?.kind === "light" && bordlampe.deviceId
      ? devices.get(bordlampe.deviceId)
      : undefined;

  const uiState = status ? toUiState(status.state) : "offline";

  const runGoodnight = async () => {
    setSceneBusy(true);
    setSceneResult(null);
    const result = await provider.executeScene(sceneId("scene.godnat"));
    setSceneResult(result);
    setSceneBusy(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mock-kontrolpanel"
        description="Styr mock-hjemmets tilstande og fejlscenarier. Ændringerne slår igennem i realtid overalt i appen."
      />

      {uiState !== "connected" ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <OfflineBanner
            state={uiState === "offline" ? "offline" : "reconnecting"}
            onRetry={() => mock.restoreConnection()}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              Forbindelse
              <ConnectionStatus state={uiState} />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                mock.simulateConnectionLoss({ reconnectAfterMs: 4000 })
              }
            >
              Kortvarigt tab (4 s)
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                mock.simulateConnectionLoss({ reconnectAfterMs: null })
              }
            >
              Gå offline
            </Button>
            <Button
              variant="secondary"
              onClick={() => mock.restoreConnection()}
            >
              Genopret
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kommandolatens</CardTitle>
          </CardHeader>
          <CardContent>
            <SegmentedControl
              label="Kommandolatens"
              value={latency}
              onValueChange={(v) => {
                setLatency(v);
                mock.setCommandLatency(latencyMs[v]);
              }}
              options={[
                { value: "normal", label: "Normal" },
                { value: "slow", label: "Langsom" },
                { value: "verySlow", label: "Meget langsom" },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-semibold">Live-enheder</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {bordlampe?.kind === "light" ? (
          <DeviceCard
            name={bordlampe.name}
            icon={Lamp}
            status={
              bordlampe.availability === "unavailable"
                ? "unavailable"
                : bordlampe.state.on
                  ? "on"
                  : "off"
            }
            detail={
              bordlampe.state.on && bordlampe.state.brightnessPct !== null
                ? `Stue · ${bordlampe.state.brightnessPct} %`
                : "Stue"
            }
            onToggle={(on) =>
              void provider.callService({
                service: on ? "light.turnOn" : "light.turnOff",
                entityId: bordlampe.id,
              })
            }
          >
            {bordlampe.state.on && bordlampe.capabilities.dim ? (
              <Slider
                min={1}
                max={100}
                value={[bordlampe.state.brightnessPct ?? 100]}
                onValueChange={([v]) => {
                  if (v !== undefined)
                    void provider.callService({
                      service: "light.turnOn",
                      entityId: bordlampe.id,
                      brightnessPct: v,
                    });
                }}
                thumbLabel={`Lysstyrke for ${bordlampe.name}`}
                valueText={`${bordlampe.state.brightnessPct ?? 100} %`}
              />
            ) : null}
          </DeviceCard>
        ) : null}

        {gruppeSpisebord?.kind === "lightGroup" ? (
          <DeviceCard
            name={gruppeSpisebord.name}
            icon={Lightbulb}
            status={gruppeSpisebord.state.on ? "on" : "off"}
            detail={`Gruppe · ${gruppeSpisebord.memberIds.length} pærer`}
            onToggle={(on) =>
              void provider.callService({
                service: on ? "light.turnOn" : "light.turnOff",
                entityId: gruppeSpisebord.id,
              })
            }
          />
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tempEntre?.kind === "sensor" ? (
          <TemperatureDisplay
            label="Entré (live)"
            valueC={tempEntre.state.value}
          />
        ) : null}
        {motion?.kind === "motion" ? (
          <div className="flex flex-col items-start gap-2">
            <StatusBadge
              status={motion.state.motion ? "on" : "off"}
              label={motion.state.motion ? "Bevægelse" : "Ingen bevægelse"}
            />
            <Button
              variant="secondary"
              onClick={() => mock.triggerMotion(motion.id)}
            >
              <PersonStanding aria-hidden="true" />
              Udløs bevægelse
            </Button>
          </div>
        ) : null}
        {co2?.kind === "airQuality" ? (
          <div className="flex flex-col items-start gap-2">
            <Badge
              variant={
                (co2.state.co2Ppm ?? 0) > 1000 ? "destructive" : "success"
              }
            >
              CO₂: {co2.state.co2Ppm ?? "–"} ppm
            </Badge>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => mock.setAirQuality(co2.id, { co2Ppm: 1600 })}
              >
                <Wind aria-hidden="true" />
                Dårlig luft
              </Button>
              <Button
                variant="ghost"
                onClick={() => mock.setAirQuality(co2.id, { co2Ppm: 640 })}
              >
                Normal
              </Button>
            </div>
          </div>
        ) : null}
        {dimmer ? (
          <div className="flex flex-col items-start gap-2">
            {dimmer.battery ? <BatteryStatus pct={dimmer.battery.pct} /> : null}
            <Button
              variant="secondary"
              onClick={() => mock.setBattery(dimmer.id, 12)}
            >
              Simulér lavt batteri
            </Button>
          </div>
        ) : null}
      </div>

      <h2 className="text-lg font-semibold">Sikkerhed</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {laas?.kind === "lock" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                Hoveddørslås
                <StatusBadge
                  status={
                    laas.state.status === "jammed"
                      ? "error"
                      : laas.state.status === "locking" ||
                          laas.state.status === "unlocking"
                        ? "busy"
                        : laas.state.status === "locked"
                          ? "on"
                          : "off"
                  }
                  label={
                    laas.state.status === "locked"
                      ? "Låst"
                      : laas.state.status === "unlocked"
                        ? "Låst op"
                        : laas.state.status === "jammed"
                          ? "Sidder fast"
                          : "Arbejder…"
                  }
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  void provider.callService({
                    service: "lock.lock",
                    entityId: laas.id,
                  })
                }
              >
                <Lock aria-hidden="true" />
                Lås
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  void provider.callService({
                    service: "lock.unlock",
                    entityId: laas.id,
                  })
                }
              >
                <LockOpen aria-hidden="true" />
                Lås op
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  mock.setLockJammed(laas.id, laas.state.status !== "jammed")
                }
              >
                {laas.state.status === "jammed"
                  ? "Fjern fejl"
                  : "Simulér fastklemt lås"}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Døre og vinduer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[hoveddor, altandor, vindue].map((opening) =>
              opening?.kind === "doorWindow" ? (
                <label
                  key={opening.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <DoorOpen
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    {opening.name}
                    <Badge variant={opening.state.open ? "warning" : "success"}>
                      {opening.state.open ? "Åben" : "Lukket"}
                    </Badge>
                  </span>
                  <Switch
                    checked={opening.state.open}
                    onCheckedChange={(open) =>
                      mock.setOpening(opening.id, open)
                    }
                    aria-label={`Simulér ${opening.name} åben`}
                  />
                </label>
              ) : null,
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-semibold">Enhedstilstande og scener</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enhed offline</CardTitle>
          </CardHeader>
          <CardContent>
            {bordlampeDevice ? (
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  Bordlampen offline
                  <span className="ml-2 text-muted-foreground">
                    (
                    {bordlampeDevice.connectivity === "online"
                      ? "online"
                      : "offline"}
                    )
                  </span>
                </span>
                <Switch
                  checked={bordlampeDevice.connectivity === "offline"}
                  onCheckedChange={(offline) =>
                    mock.setDeviceConnectivity(bordlampeDevice.id, !offline)
                  }
                  aria-label="Simulér bordlampen offline"
                />
              </label>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scenekald</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              variant="secondary"
              disabled={sceneBusy}
              onClick={() => void runGoodnight()}
            >
              <Moon aria-hidden="true" />
              {sceneBusy ? "Kører Godnat…" : "Kør scenen Godnat"}
            </Button>
            {sceneResult ? (
              <ul className="flex flex-col gap-1 text-sm">
                {sceneResult.steps.map((step) => (
                  <li key={step.label} className="flex items-center gap-2">
                    <StatusBadge
                      status={step.ok ? "on" : "error"}
                      label={step.ok ? "OK" : (step.error ?? "Fejl")}
                    />
                    <span className="truncate text-muted-foreground">
                      {step.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-semibold">Notifikationer fra mock-hjemmet</h2>
      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ingen endnu – prøv fx at simulere lavt batteri eller en fastklemt lås.
        </p>
      ) : (
        <div className="flex max-w-xl flex-col gap-3">
          {notifications.map((n) => (
            <AlertCard
              key={n.id}
              severity={n.severity}
              title={n.title}
              description={n.body}
              onDismiss={() =>
                toast(
                  "Notifikationer kan afvises i den rigtige notifikationsvisning",
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
