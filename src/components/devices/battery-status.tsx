"use client";

import * as React from "react";
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";

interface BatteryStatusProps {
  /** 0–100. */
  pct: number;
  charging?: boolean;
  className?: string;
}

const LOW_THRESHOLD = 20;

function pickIcon(pct: number, charging: boolean): LucideIcon {
  if (charging) return BatteryCharging;
  if (pct <= 10) return BatteryWarning;
  if (pct <= LOW_THRESHOLD) return BatteryLow;
  if (pct <= 60) return BatteryMedium;
  return BatteryFull;
}

/**
 * Batteristatus med ikon, procenttal og eksplicit "Lavt batteri"-tekst
 * under 20 % (farve er aldrig eneste markør).
 */
function BatteryStatus({
  pct,
  charging = false,
  className,
}: BatteryStatusProps) {
  const t = useTranslations("battery");
  const clamped = Math.min(100, Math.max(0, Math.round(pct)));
  const low = !charging && clamped <= LOW_THRESHOLD;
  const Icon = pickIcon(clamped, charging);

  return (
    <span
      role="img"
      aria-label={t("level", { pct: clamped })}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm tabular-nums",
        low ? "text-warning" : "text-muted-foreground",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4.5" />
      {clamped} %
      {low ? <span className="text-xs font-medium">· {t("low")}</span> : null}
      {charging ? <span className="text-xs">· {t("charging")}</span> : null}
    </span>
  );
}

export { BatteryStatus };
