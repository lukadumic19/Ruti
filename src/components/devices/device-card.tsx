"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { StatusBadge, type DeviceUiStatus } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/cn";

interface DeviceCardProps {
  name: string;
  icon: LucideIcon;
  status: DeviceUiStatus;
  /** Overstyr statustekst, fx "Låst" eller "80 %". */
  statusLabel?: string;
  /** Supplerende linje, fx "Stue · 60 %". */
  detail?: string;
  /** Vis tænd/sluk-kontakt. Deaktiveres automatisk ved unavailable/error/busy. */
  onToggle?: (on: boolean) => void;
  /** Udvidede kontroller (slider, farvevalg …) vises under hovedrækken. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Enhedskort – grundbyggesten for lys, lås, stik m.m.
 * Tilstande skelnes med ikonflise-baggrund, badge (ikon+tekst) og opacitet –
 * aldrig kun farve. Utilgængelige enheder vises nedtonede, aldrig skjulte
 * (TECHNICAL_ARCHITECTURE §8).
 */
function DeviceCard({
  name,
  icon: Icon,
  status,
  statusLabel,
  detail,
  onToggle,
  children,
  className,
}: DeviceCardProps) {
  const t = useTranslations("deviceStatus");
  const interactive = status === "on" || status === "off";
  const dimmed = status === "unavailable";

  return (
    <Card
      aria-busy={status === "busy" || undefined}
      className={cn("p-4", dimmed && "opacity-60", className)}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-md",
            status === "on" && "bg-light-on-soft text-light-on",
            status === "off" && "bg-muted text-muted-foreground",
            status === "busy" && "bg-info-soft text-info",
            status === "unavailable" && "bg-muted text-muted-foreground",
            status === "error" && "bg-destructive-soft text-destructive",
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <StatusBadge
              status={status}
              {...(statusLabel ? { label: statusLabel } : {})}
            />
            {detail ? (
              <span className="truncate text-xs text-muted-foreground">
                {detail}
              </span>
            ) : null}
          </div>
        </div>
        {onToggle ? (
          <Switch
            checked={status === "on"}
            onCheckedChange={onToggle}
            disabled={!interactive}
            aria-label={name}
          />
        ) : null}
      </div>
      {status === "error" ? (
        <p className="mt-3 text-sm text-destructive" role="status">
          {statusLabel ?? t("error")}
        </p>
      ) : null}
      {children ? (
        <div className="mt-4 flex flex-col gap-3">{children}</div>
      ) : null}
    </Card>
  );
}

export { DeviceCard };
