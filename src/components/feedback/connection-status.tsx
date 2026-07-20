"use client";

import * as React from "react";
import {
  FlaskConical,
  RefreshCw,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";

export type ConnectionUiState =
  "connected" | "reconnecting" | "offline" | "demo";

const config: Record<
  ConnectionUiState,
  { icon: LucideIcon; className: string; spin?: boolean }
> = {
  connected: { icon: Wifi, className: "bg-success-soft text-success" },
  reconnecting: {
    icon: RefreshCw,
    className: "bg-warning-soft text-warning",
    spin: true,
  },
  offline: { icon: WifiOff, className: "bg-destructive-soft text-destructive" },
  demo: { icon: FlaskConical, className: "bg-warning-soft text-warning" },
};

interface ConnectionStatusProps {
  state: ConnectionUiState;
  className?: string;
}

/**
 * Forbindelsesstatus-pille (grøn/gul/rød/demo, FEATURE_REQUIREMENTS §18) –
 * altid med ikon og tekst, annonceres høfligt til skærmlæsere ved skift.
 */
function ConnectionStatus({ state, className }: ConnectionStatusProps) {
  const t = useTranslations("connection");
  const { icon: Icon, className: stateClasses, spin } = config[state];
  return (
    <span
      role="status"
      aria-label={`${t("statusLabel")}: ${t(state)}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        stateClasses,
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("size-3.5", spin && "animate-spin")}
      />
      {t(state)}
    </span>
  );
}

export { ConnectionStatus };
