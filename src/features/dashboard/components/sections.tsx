"use client";

import * as React from "react";
import {
  Battery,
  DoorClosed,
  Droplets,
  Lightbulb,
  Thermometer,
  Trash2,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { RoomCard } from "@/components/rooms/room-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roomIcon } from "@/lib/icons";
import { formatRelativeTime } from "@/lib/utils/relative-time";
import type { AirQualityLevel } from "@/config/air-quality";
import type {
  ClimateRoomReading,
  HomeSummary,
} from "@/features/dashboard/derive";
import type { Light, Notification, Room } from "@/types";

import { SectionCard } from "./section-card";

const numberFmt = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 1 });

/* ------------------------------- Sikkerhed ------------------------------- */

export function SecuritySection({
  security,
}: {
  security: HomeSummary["security"];
}) {
  const t = useTranslations("dashboard");
  const openCount = security.openOpenings.length;
  const total = security.openings.length;

  return (
    <SectionCard title={t("sections.security")}>
      <div className="flex flex-wrap items-center gap-2">
        {security.locks.map((lock) => (
          <StatusBadge
            key={lock.id}
            status={
              lock.state.status === "jammed"
                ? "error"
                : lock.state.status === "locked"
                  ? "on"
                  : "off"
            }
            label={
              lock.state.status === "jammed"
                ? t("security.jammed")
                : lock.state.status === "locked"
                  ? t("security.locked")
                  : t("security.unlocked")
            }
          />
        ))}
        <Badge variant={openCount === 0 ? "success" : "warning"}>
          {t("security.openings", { open: openCount, total })}
        </Badge>
      </div>
    </SectionCard>
  );
}

/* --------------------------- Døre og vinduer ----------------------------- */

export function OpeningsSection({
  security,
  now,
}: {
  security: HomeSummary["security"];
  now?: Date;
}) {
  const t = useTranslations("dashboard");
  const open = security.openOpenings;

  return (
    <SectionCard title={t("sections.openings")}>
      {open.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <DoorClosed aria-hidden="true" className="size-4 text-success" />
          {t("openings.allClosed")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {open.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span>{o.name}</span>
              <Badge variant="warning">
                {o.state.openSince
                  ? formatRelativeTime(o.state.openSince, now)
                  : t("openings.openSince")}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/* -------------------------------- Klima ---------------------------------- */

function ClimateRow({ reading }: { reading: ClimateRoomReading }) {
  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      <span className="truncate">{reading.roomName}</span>
      <span className="flex shrink-0 items-center gap-3 text-muted-foreground tabular-nums">
        {reading.temperatureC !== null ? (
          <span className="flex items-center gap-1">
            <Thermometer aria-hidden="true" className="size-3.5" />
            {numberFmt.format(reading.temperatureC)} °C
          </span>
        ) : null}
        {reading.humidityPct !== null ? (
          <span className="flex items-center gap-1">
            <Droplets aria-hidden="true" className="size-3.5" />
            {Math.round(reading.humidityPct)} %
          </span>
        ) : null}
      </span>
    </li>
  );
}

export function ClimateSection({
  climate,
}: {
  climate: HomeSummary["climate"];
}) {
  const t = useTranslations("dashboard");
  return (
    <SectionCard
      title={t("sections.climate")}
      headerRight={
        climate.averageTempC !== null ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {t("climate.average", {
              temp: numberFmt.format(climate.averageTempC),
            })}
          </span>
        ) : undefined
      }
    >
      {climate.rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("climate.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {climate.rooms.map((r) => (
            <ClimateRow key={r.roomId ?? r.roomName} reading={r} />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/* ----------------------------- Luftkvalitet ------------------------------ */

const airBadge: Record<AirQualityLevel, "success" | "warning" | "destructive"> =
  {
    good: "success",
    moderate: "warning",
    poor: "destructive",
  };

export function AirQualitySection({
  airQuality,
}: {
  airQuality: HomeSummary["airQuality"];
}) {
  const t = useTranslations("dashboard");
  return (
    <SectionCard title={t("sections.airQuality")}>
      {airQuality.readings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("airQuality.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {airQuality.readings.map((r) => (
            <li
              key={r.name}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="truncate">{r.name}</span>
              <span className="flex shrink-0 items-center gap-2">
                {r.co2Ppm !== null ? (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t("airQuality.co2", { value: r.co2Ppm })}
                  </span>
                ) : null}
                <Badge variant={airBadge[r.level]}>
                  {t(`airQuality.${r.level}`)}
                </Badge>
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/* ---------------------------- Aktive lamper ------------------------------ */

export function ActiveLightsSection({
  lights,
  onTurnOff,
  busy,
}: {
  lights: readonly Light[];
  onTurnOff: (light: Light) => void;
  busy?: boolean;
}) {
  const t = useTranslations("dashboard");
  return (
    <SectionCard title={t("sections.activeLights")}>
      {lights.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("activeLights.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lights.map((light) => (
            <li
              key={light.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Lightbulb
                  aria-hidden="true"
                  className="size-4 shrink-0 text-light-on"
                />
                <span className="truncate">{light.name}</span>
                {light.state.brightnessPct !== null ? (
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {light.state.brightnessPct} %
                  </span>
                ) : null}
              </span>
              <Button
                variant="ghost"
                onClick={() => onTurnOff(light)}
                disabled={busy}
                className="h-9 min-h-9 px-3 text-xs"
              >
                {t("activeLights.turnOff")}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/* ----------------------------- Favoritrum -------------------------------- */

export interface FavoriteRoomVM {
  room: Room;
  temperatureC: number | null;
  lightsOnCount: number;
}

export function FavoriteRoomsSection({
  rooms,
}: {
  rooms: readonly FavoriteRoomVM[];
}) {
  const t = useTranslations("dashboard");
  if (rooms.length === 0) return null;
  return (
    <section aria-label={t("sections.favoriteRooms")}>
      <h2 className="mb-3 text-sm font-semibold">
        {t("sections.favoriteRooms")}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rooms.map((vm) => (
          <RoomCard
            key={vm.room.id}
            name={vm.room.name}
            icon={roomIcon(vm.room.icon)}
            {...(vm.temperatureC !== null
              ? { temperatureC: vm.temperatureC }
              : {})}
            lightsLabel={
              vm.lightsOnCount === 0
                ? t("roomLights.none")
                : t("roomLights.count", { count: vm.lightsOnCount })
            }
            href={`/rum#${vm.room.id}`}
          />
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Robotstøvsuger ------------------------------ */

export function VacuumSection({ vacuum }: { vacuum: HomeSummary["vacuum"] }) {
  const t = useTranslations("dashboard");
  if (!vacuum) return null;
  const activity = vacuum.state.activity;
  return (
    <SectionCard title={t("sections.vacuum")}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2">
          <Trash2 aria-hidden="true" className="size-4 text-muted-foreground" />
          {t(`vacuum.${activity}`)}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground tabular-nums">
          <Battery aria-hidden="true" className="size-4" />
          {t("vacuum.battery", { pct: vacuum.state.batteryPct })}
        </span>
      </div>
    </SectionCard>
  );
}

/* ------------------------------- Energi ---------------------------------- */

export function EnergySection({ energy }: { energy: HomeSummary["energy"] }) {
  const t = useTranslations("dashboard");
  if (!energy) return null;
  return (
    <SectionCard title={t("sections.energy")}>
      <div className="flex items-center gap-6 text-sm">
        <span className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {t("energy.now")}
          </span>
          <span className="flex items-center gap-1 font-semibold tabular-nums">
            <Zap aria-hidden="true" className="size-4 text-warning" />
            {t("energy.watt", { value: energy.state.powerW ?? 0 })}
          </span>
        </span>
        <span className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {t("energy.today")}
          </span>
          <span className="font-semibold tabular-nums">
            {t("energy.kwh", {
              value: numberFmt.format(energy.state.todayKwh ?? 0),
            })}
          </span>
        </span>
      </div>
    </SectionCard>
  );
}

/* -------------------------- Seneste hændelser ---------------------------- */

export function RecentEventsSection({
  notifications,
  now,
}: {
  notifications: readonly Notification[];
  now?: Date;
}) {
  const t = useTranslations("dashboard");
  return (
    <SectionCard title={t("sections.recentEvents")}>
      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("recentEvents.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.slice(0, 5).map((n) => (
            <li key={n.id} className="flex flex-col text-sm">
              <span className="font-medium">{n.title}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(n.at, now)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
