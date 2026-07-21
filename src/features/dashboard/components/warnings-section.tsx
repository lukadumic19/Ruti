"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { AlertCard } from "@/components/feedback/alert-card";
import type { DashboardWarning } from "@/features/dashboard/derive";

function warningText(
  warning: DashboardWarning,
  t: ReturnType<typeof useTranslations>,
): string {
  switch (warning.kind) {
    case "lockJammed":
      return t("lockJammed", { name: warning.name });
    case "offlineDevice":
      return t("offlineDevice", { name: warning.name });
    case "airQualityPoor":
      return t("airQualityPoor", { name: warning.name });
    case "lowBattery":
      return t("lowBattery", { name: warning.name, pct: warning.pct });
    case "vacuumStuck":
      return t("vacuumStuck", { name: warning.name });
  }
}

/**
 * Advarsler samlet ét sted. Tom-tilstand er bevidst positiv ("alt ser fint ud")
 * frem for en tom flade.
 */
export function WarningsSection({
  warnings,
}: {
  warnings: readonly DashboardWarning[];
}) {
  const t = useTranslations("dashboard.warnings");

  if (warnings.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck aria-hidden="true" className="size-4 text-success" />
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {warnings.map((warning, i) => (
        <AlertCard
          key={`${warning.kind}-${i}`}
          severity={warning.severity}
          title={warningText(warning, t)}
        />
      ))}
    </div>
  );
}
