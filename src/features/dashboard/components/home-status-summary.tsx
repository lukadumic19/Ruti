"use client";

import * as React from "react";
import {
  CircleAlert,
  DoorClosed,
  DoorOpen,
  Lightbulb,
  Lock,
  LockOpen,
  Trash2,
  TriangleAlert,
  Wind,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";
import type {
  HomeStatusItem,
  HomeStatusSeverity,
} from "@/features/dashboard/derive";

const severityText: Record<HomeStatusSeverity, string> = {
  critical: "text-destructive",
  warning: "text-warning",
  info: "text-muted-foreground",
  good: "text-success",
};

interface Line {
  icon: LucideIcon;
  text: string;
  severity: HomeStatusSeverity;
}

type StatusTranslator = ReturnType<typeof useTranslations>;

function toLine(item: HomeStatusItem, t: StatusTranslator): Line {
  switch (item.kind) {
    case "lock":
      return item.jammed
        ? { icon: CircleAlert, text: t("lockJammed"), severity: item.severity }
        : item.locked
          ? { icon: Lock, text: t("locked"), severity: item.severity }
          : { icon: LockOpen, text: t("unlocked"), severity: item.severity };
    case "openings":
      return item.count === 0
        ? { icon: DoorClosed, text: t("allClosed"), severity: item.severity }
        : {
            icon: DoorOpen,
            text:
              item.count === 1
                ? t("openOne")
                : t("openMany", { count: item.count }),
            severity: item.severity,
          };
    case "offline":
      return {
        icon: WifiOff,
        text:
          item.count === 1
            ? t("offlineOne")
            : t("offlineMany", { count: item.count }),
        severity: item.severity,
      };
    case "airQuality":
      return {
        icon: Wind,
        text:
          item.level === "good"
            ? t("airGood")
            : item.level === "moderate"
              ? t("airModerate")
              : t("airPoor"),
        severity: item.severity,
      };
    case "lightsOn":
      return {
        icon: Lightbulb,
        text:
          item.count === 0
            ? t("lightsNone")
            : item.count === 1
              ? t("lightsOne")
              : t("lightsMany", { count: item.count }),
        severity: item.severity,
      };
    case "vacuum":
      return {
        icon: item.activity === "stuck" ? TriangleAlert : Trash2,
        text:
          item.activity === "cleaning"
            ? t("vacuumCleaning")
            : item.activity === "returning"
              ? t("vacuumReturning")
              : item.activity === "paused"
                ? t("vacuumPaused")
                : t("vacuumStuck"),
        severity: item.severity,
      };
  }
}

/** Kort hjemmestatus i topområdet: ikon + tekst pr. linje, farve aldrig alene. */
export function HomeStatusSummary({
  items,
}: {
  items: readonly HomeStatusItem[];
}) {
  const t = useTranslations("dashboard.status");
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, i) => {
        const line = toLine(item, t);
        const Icon = line.icon;
        return (
          <li
            key={`${item.kind}-${i}`}
            className="flex items-center gap-2 text-sm"
          >
            <Icon
              aria-hidden="true"
              className={cn("size-4 shrink-0", severityText[line.severity])}
            />
            <span>{line.text}</span>
          </li>
        );
      })}
    </ul>
  );
}
