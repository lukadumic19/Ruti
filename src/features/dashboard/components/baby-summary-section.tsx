"use client";

import * as React from "react";
import { Baby, Milk, Timer } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/relative-time";
import type { BabyEvent } from "@/types";

import { SectionCard } from "./section-card";

function latest(
  events: readonly BabyEvent[],
  type: BabyEvent["type"],
): BabyEvent | null {
  let newest: BabyEvent | null = null;
  for (const e of events) {
    if (e.type !== type) continue;
    if (!newest || e.at > newest.at) newest = e;
  }
  return newest;
}

/**
 * Kompakt babyoversigt til dashboardet – vises kun når babytilstand er aktiv
 * (FEATURE_REQUIREMENTS §14). Fuld side ligger under /baby.
 */
export function BabySummarySection({
  events,
  now,
}: {
  events: readonly BabyEvent[];
  now?: Date;
}) {
  const t = useTranslations("dashboard.baby");
  const feeding = latest(events, "feeding");
  const diaper = latest(events, "diaper");

  return (
    <SectionCard
      title={t("active")}
      icon={Baby}
      href="/baby"
      className="border-primary/40 bg-primary/5"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2">
            <Milk aria-hidden="true" className="size-4 text-muted-foreground" />
            {t("lastFeeding")}
          </span>
          <Badge variant="outline">
            {feeding ? formatRelativeTime(feeding.at, now) : t("none")}
          </Badge>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2">
            <Timer
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            {t("lastDiaper")}
          </span>
          <Badge variant="outline">
            {diaper ? formatRelativeTime(diaper.at, now) : t("none")}
          </Badge>
        </div>
      </div>
    </SectionCard>
  );
}
