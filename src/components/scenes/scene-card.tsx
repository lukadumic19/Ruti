"use client";

import * as React from "react";
import { Check, Loader2, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";

interface SceneCardProps {
  name: string;
  icon: LucideIcon;
  /** Kort beskrivelse, fx "Slukker alt lys og låser døren". */
  description?: string;
  /** For tilstande (baby/ferie): scene er vedvarende aktiv. */
  active?: boolean;
  /** Aktivering i gang. */
  busy?: boolean;
  disabled?: boolean;
  onActivate: () => void;
  className?: string;
}

/**
 * Scenekort: ét tryk aktiverer (PRODUCT_VISION §5.1). Aktiv tilstand vises
 * med flueben + "Aktiv"-badge, ikke kun farve. Busy viser spinner og
 * blokerer dobbeltaktivering.
 */
function SceneCard({
  name,
  icon: Icon,
  description,
  active = false,
  busy = false,
  disabled = false,
  onActivate,
  className,
}: SceneCardProps) {
  const t = useTranslations("deviceStatus");

  return (
    <button
      type="button"
      onClick={onActivate}
      disabled={disabled || busy}
      aria-pressed={active}
      aria-busy={busy || undefined}
      className={cn(
        "flex min-h-24 flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors disabled:pointer-events-none disabled:opacity-50",
        active
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:bg-muted",
        className,
      )}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-10 items-center justify-center rounded-md",
            active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Icon className="size-5" />
          )}
        </span>
        {active && !busy ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            <Check aria-hidden="true" className="size-3" />
            {t("active")}
          </span>
        ) : null}
        {busy ? (
          <span className="text-xs text-muted-foreground">{t("busy")}</span>
        ) : null}
      </span>
      <span className="font-medium">{name}</span>
      {description ? (
        <span className="text-xs text-muted-foreground">{description}</span>
      ) : null}
    </button>
  );
}

export { SceneCard };
