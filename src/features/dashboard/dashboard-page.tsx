"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { OfflineBanner } from "@/components/feedback/offline-banner";
import { ErrorState } from "@/components/states/error-state";
import { PageSkeleton } from "@/components/states/page-skeleton";
import { useConnectionStatus, useLiveHome } from "@/features/home/hooks";
import { useHomeProviderOrNull } from "@/features/home/home-provider-context";
import {
  buildHomeSummary,
  buildStatusItems,
  lightsOnCountByRoom,
} from "@/features/dashboard/derive";
import { defaultFavoriteRoomIds } from "@/features/dashboard/cards";
import {
  greetingSlot,
  recommendedSceneId,
} from "@/features/dashboard/greeting";
import type { Light, Scene } from "@/types";

import { BabySummarySection } from "./components/baby-summary-section";
import { HomeStatusSummary } from "./components/home-status-summary";
import { QuickActions } from "./components/quick-actions";
import {
  ActiveLightsSection,
  AirQualitySection,
  ClimateSection,
  EnergySection,
  type FavoriteRoomVM,
  FavoriteRoomsSection,
  OpeningsSection,
  RecentEventsSection,
  SecuritySection,
  VacuumSection,
} from "./components/sections";
import { WarningsSection } from "./components/warnings-section";

const greetingKey = {
  morning: "greetingMorning",
  afternoon: "greetingAfternoon",
  evening: "greetingEvening",
  night: "greetingNight",
} as const;

const clockFmt = new Intl.DateTimeFormat("da-DK", {
  hour: "2-digit",
  minute: "2-digit",
});
const dateFmt = new Intl.DateTimeFormat("da-DK", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Live-ur til tablet-/vægvisning. Opdaterer hvert minut. */
function useClock(): Date {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function DashboardPage() {
  const t = useTranslations("dashboard");
  const provider = useHomeProviderOrNull();
  const status = useConnectionStatus();
  const {
    loading,
    error,
    snapshot,
    entities,
    devices,
    scenes,
    notifications,
    retry,
  } = useLiveHome();
  const now = useClock();
  const [busySceneId, setBusySceneId] = React.useState<Scene["id"] | null>(
    null,
  );
  const [lightBusy, setLightBusy] = React.useState(false);

  const isOffline =
    status?.state === "offline" || status?.state === "disconnected";
  const isReconnecting =
    status?.state === "reconnecting" || status?.state === "connecting";
  // Kommandoer må kun sendes når forbindelsen er etableret. null (ingen
  // datakilde konfigureret) betragtes som klar, så UI'et ikke låser i live-fasen.
  const canControl = status === null || status.state === "connected";

  const summary = React.useMemo(
    () =>
      buildHomeSummary({
        entities: entities.values(),
        devices: devices.values(),
        scenes: scenes.values(),
        rooms: snapshot?.rooms ?? [],
      }),
    [entities, devices, scenes, snapshot],
  );

  const statusItems = React.useMemo(() => buildStatusItems(summary), [summary]);

  const favoriteRooms = React.useMemo<FavoriteRoomVM[]>(() => {
    const rooms = snapshot?.rooms ?? [];
    const lightCounts = lightsOnCountByRoom(entities.values());
    const tempByRoom = new Map(
      summary.climate.rooms.map((r) => [r.roomId, r.temperatureC]),
    );
    return defaultFavoriteRoomIds
      .map((id) => rooms.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined)
      .map((room) => ({
        room,
        temperatureC: tempByRoom.get(room.id) ?? null,
        lightsOnCount: lightCounts.get(room.id) ?? 0,
      }));
  }, [snapshot, entities, summary]);

  const runScene = React.useCallback(
    async (scene: Scene) => {
      if (!provider) return;
      setBusySceneId(scene.id);
      const result = await provider.executeScene(scene.id);
      setBusySceneId(null);
      if (result.ok) {
        toast.success(t("sceneActivated", { name: scene.name }));
      } else if (result.steps.some((s) => s.ok)) {
        toast.warning(t("scenePartial", { name: scene.name }));
      } else {
        toast.error(t("sceneFailed", { name: scene.name }));
      }
    },
    [provider, t],
  );

  const turnOffLight = React.useCallback(
    async (light: Light) => {
      if (!provider) return;
      setLightBusy(true);
      const result = await provider.callService({
        service: "light.turnOff",
        entityId: light.id,
      });
      setLightBusy(false);
      if (!result.ok) {
        toast.error(t("sceneFailed", { name: light.name }));
      }
    },
    [provider, t],
  );

  if (loading) return <PageSkeleton label={t("loading")} />;
  if (error) {
    return (
      <ErrorState
        title={t("errorTitle")}
        description={t("errorDescription")}
        onRetry={retry}
      />
    );
  }

  const slot = greetingSlot(now);
  const recommended = recommendedSceneId(now, new Set(scenes.keys()));

  return (
    <div className="flex flex-col gap-6">
      {isOffline || isReconnecting ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <OfflineBanner
            state={isOffline ? "offline" : "reconnecting"}
            {...(isOffline && provider
              ? {
                  onRetry: () => {
                    void provider.connect();
                  },
                }
              : {})}
          />
        </div>
      ) : null}

      {/* Topområde: hilsen, ur/dato (tablet/desktop) og hjemmestatus */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t(greetingKey[slot])}
            </h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <HomeStatusSummary items={statusItems} />
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-3xl font-semibold tabular-nums">
            {clockFmt.format(now)}
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            {dateFmt.format(now)}
          </p>
        </div>
      </header>

      <QuickActions
        scenes={scenes}
        busySceneId={busySceneId}
        recommendedSceneId={recommended}
        disabled={!canControl}
        onActivate={(scene) => void runScene(scene)}
      />

      {summary.babyModeActive ? (
        <BabySummarySection events={snapshot?.babyEvents ?? []} now={now} />
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">
            {t("sections.warnings")}
          </h2>
          <WarningsSection warnings={summary.warnings} />
        </div>
        <SecuritySection security={summary.security} />
        <OpeningsSection security={summary.security} now={now} />
        <ClimateSection climate={summary.climate} />
        <AirQualitySection airQuality={summary.airQuality} />
        <VacuumSection vacuum={summary.vacuum} />
        <EnergySection energy={summary.energy} />
        <RecentEventsSection notifications={notifications} now={now} />
        <ActiveLightsSection
          lights={summary.activeLights}
          onTurnOff={(light) => void turnOffLight(light)}
          busy={lightBusy}
        />
      </div>

      <FavoriteRoomsSection rooms={favoriteRooms} />
    </div>
  );
}
