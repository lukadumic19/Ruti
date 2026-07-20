"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Droplets,
  Lightbulb,
  Thermometer,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface RoomCardProps {
  name: string;
  icon: LucideIcon;
  /** Formaterede metatekster genereres af kortet ud fra rå værdier. */
  temperatureC?: number;
  humidityPct?: number;
  /** Tekst som "2 lys tændt" – oversættes af kalderen (pluralisering). */
  lightsLabel?: string;
  /** Rendered som link når href er sat, ellers som knap. */
  href?: string;
  onPress?: () => void;
  className?: string;
}

const tempFormat = new Intl.NumberFormat("da-DK", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * Rumkort til rumlisten og dashboardet: navn, indeklima-resumé og antal
 * tændte lys (FEATURE_REQUIREMENTS §2). Hele kortet er trykfladen.
 */
function RoomCard({
  name,
  icon: Icon,
  temperatureC,
  humidityPct,
  lightsLabel,
  href,
  onPress,
  className,
}: RoomCardProps) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{name}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
          {temperatureC !== undefined ? (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Thermometer aria-hidden="true" className="size-3.5" />
              {tempFormat.format(temperatureC)} °C
            </span>
          ) : null}
          {humidityPct !== undefined ? (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Droplets aria-hidden="true" className="size-3.5" />
              {Math.round(humidityPct)} %
            </span>
          ) : null}
          {lightsLabel ? (
            <span className="inline-flex items-center gap-1">
              <Lightbulb aria-hidden="true" className="size-3.5" />
              {lightsLabel}
            </span>
          ) : null}
        </span>
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-5 shrink-0 text-muted-foreground"
      />
    </>
  );

  const interactiveClasses =
    "flex min-h-14 w-full items-center gap-3 p-4 text-left hover:bg-muted";

  return (
    <Card className={cn("overflow-hidden p-0", className)}>
      {href ? (
        <Link href={href} className={interactiveClasses}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onPress} className={interactiveClasses}>
          {content}
        </button>
      )}
    </Card>
  );
}

export { RoomCard };
