"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

interface SensorValueProps {
  label: string;
  /** null = ingen data (tom-tilstand vises); undefined sammen med loading. */
  value: number | null;
  unit: string;
  icon?: LucideIcon;
  /** Antal decimaler (da-DK-format). */
  decimals?: number;
  /** Markér at værdien kan være forældet (> 15 min, FEATURE_REQUIREMENTS §5). */
  stale?: boolean;
  loading?: boolean;
  className?: string;
}

const formatters = new Map<number, Intl.NumberFormat>();

function formatNumber(value: number, decimals: number): string {
  let formatter = formatters.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat("da-DK", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatters.set(decimals, formatter);
  }
  return formatter.format(value);
}

/** Sensorværdi med enhed, tom-tilstand og "muligvis forældet"-markering. */
function SensorValue({
  label,
  value,
  unit,
  icon: Icon,
  decimals = 0,
  stale = false,
  loading = false,
  className,
}: SensorValueProps) {
  const t = useTranslations("deviceStatus");

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {Icon ? (
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
        >
          <Icon className="size-4.5" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-5 w-16" />
        ) : value === null ? (
          <p className="text-sm text-muted-foreground">{t("noData")}</p>
        ) : (
          <p className="text-lg leading-tight font-semibold tabular-nums">
            {formatNumber(value, decimals)}
            <span className="ml-0.5 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          </p>
        )}
        {stale && !loading && value !== null ? (
          <p className="text-xs text-warning">{t("stale")}</p>
        ) : null}
      </div>
    </div>
  );
}

export { SensorValue };
