"use client";

import * as React from "react";
import {
  CircleAlert,
  Info,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export type AlertSeverity = "info" | "warning" | "critical";

const config: Record<
  AlertSeverity,
  { icon: LucideIcon; container: string; iconColor: string }
> = {
  info: {
    icon: Info,
    container: "border-info/30 bg-info-soft",
    iconColor: "text-info",
  },
  warning: {
    icon: TriangleAlert,
    container: "border-warning/30 bg-warning-soft",
    iconColor: "text-warning",
  },
  critical: {
    icon: CircleAlert,
    container: "border-destructive/30 bg-destructive-soft",
    iconColor: "text-destructive",
  },
};

interface AlertCardProps {
  severity: AlertSeverity;
  title: string;
  description?: string;
  /** Valgfri handling, fx "Se enhed" eller "Prøv igen". */
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  className?: string;
}

/**
 * Advarselskort til notifikationer og fejl i indhold (DATA_MODEL §7-severities).
 * Kritiske advarsler annonceres med role="alert"; øvrige med role="status".
 */
function AlertCard({
  severity,
  title,
  description,
  action,
  onDismiss,
  className,
}: AlertCardProps) {
  const t = useTranslations("controls");
  const { icon: Icon, container, iconColor } = config[severity];

  return (
    <div
      role={severity === "critical" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        container,
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-0.5 size-5 shrink-0", iconColor)}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
        {action ? (
          <Button
            variant="outline"
            onClick={action.onClick}
            className="mt-3 h-9 min-h-9 bg-transparent px-3"
          >
            {action.label}
          </Button>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("close")}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground"
        >
          <X aria-hidden="true" className="size-4.5" />
        </button>
      ) : null}
    </div>
  );
}

export { AlertCard };
