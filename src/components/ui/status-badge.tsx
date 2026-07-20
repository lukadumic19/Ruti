"use client";

import * as React from "react";
import {
  CircleAlert,
  CircleOff,
  Loader2,
  Power,
  PowerOff,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export type DeviceUiStatus = "on" | "off" | "unavailable" | "error" | "busy";

const statusConfig: Record<
  DeviceUiStatus,
  {
    icon: LucideIcon;
    variant: React.ComponentProps<typeof Badge>["variant"];
    spin?: boolean;
  }
> = {
  on: { icon: Power, variant: "success" },
  off: { icon: PowerOff, variant: "outline" },
  unavailable: { icon: CircleOff, variant: "default" },
  error: { icon: CircleAlert, variant: "destructive" },
  busy: { icon: Loader2, variant: "info", spin: true },
};

interface StatusBadgeProps {
  status: DeviceUiStatus;
  /** Overstyr standardteksten (fx "Låst" i stedet for "Tændt"). */
  label?: string;
  className?: string;
}

/**
 * Statusbadge med ikon OG tekst – farven er aldrig eneste informationsbærer
 * (DESIGN_PRINCIPLES §1.3).
 */
function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const t = useTranslations("deviceStatus");
  const config = statusConfig[status];
  const Icon = config.icon;
  const text = label ?? t(status);
  return (
    <Badge variant={config.variant} className={className}>
      <Icon
        aria-hidden="true"
        className={cn("size-3", config.spin && "animate-spin")}
      />
      {text}
    </Badge>
  );
}

export { StatusBadge };
