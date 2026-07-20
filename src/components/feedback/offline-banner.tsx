"use client";

import * as React from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface OfflineBannerProps {
  /** "offline" = ingen forbindelse (rød); "reconnecting" = genopretter (gul). */
  state: "offline" | "reconnecting";
  /** Vis "Prøv igen"-knap (kun relevant i offline-tilstand). */
  onRetry?: () => void;
  className?: string;
}

/**
 * Globalt banner for tabt forbindelse (TECHNICAL_ARCHITECTURE §8).
 * role="status" + aria-live, så skærmlæsere får besked uden afbrydelse.
 */
function OfflineBanner({ state, onRetry, className }: OfflineBannerProps) {
  const t = useTranslations("connection");
  const tStates = useTranslations("states");
  const offline = state === "offline";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2.5 text-sm",
        offline
          ? "border-destructive/30 bg-destructive-soft text-destructive"
          : "border-warning/30 bg-warning-soft text-warning",
        className,
      )}
    >
      {offline ? (
        <WifiOff aria-hidden="true" className="size-4.5 shrink-0" />
      ) : (
        <RefreshCw
          aria-hidden="true"
          className="size-4.5 shrink-0 animate-spin"
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="font-medium">
          {offline ? t("offlineBannerTitle") : t("reconnectingBannerTitle")}
        </span>{" "}
        <span className="opacity-80">
          {offline
            ? t("offlineBannerDescription")
            : t("reconnectingBannerDescription")}
        </span>
      </span>
      {offline && onRetry ? (
        <Button
          variant="outline"
          onClick={onRetry}
          className="h-9 min-h-9 shrink-0 border-current bg-transparent px-3 text-current hover:bg-card"
        >
          {tStates("retry")}
        </Button>
      ) : null}
    </div>
  );
}

export { OfflineBanner };
