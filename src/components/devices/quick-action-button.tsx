"use client";

import * as React from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";

interface QuickActionButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  icon: LucideIcon;
  label: string;
  /** Til/fra-agtige handlinger: markeres visuelt og med aria-pressed. */
  active?: boolean;
  /** Viser spinner og deaktiverer knappen, mens handlingen udføres. */
  busy?: boolean;
}

/**
 * Stor hurtighandlingsknap (ikon + label, min. 80 px høj) til dashboard,
 * babytilstandens nattehandlinger og vægpanelet. Brugbar med én hånd i mørke.
 */
function QuickActionButton({
  icon: Icon,
  label,
  active = false,
  busy = false,
  className,
  disabled,
  ...props
}: QuickActionButtonProps) {
  const t = useTranslations("deviceStatus");
  return (
    <button
      type="button"
      // Stabilt navn til skærmlæsere, uanset om knappen viser "Arbejder…".
      aria-label={label}
      aria-pressed={active}
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      className={cn(
        "flex min-h-20 min-w-20 flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted",
        className,
      )}
      {...props}
    >
      {busy ? (
        <Loader2 aria-hidden="true" className="size-6 animate-spin" />
      ) : (
        <Icon aria-hidden="true" className="size-6" />
      )}
      <span>{busy ? t("busy") : label}</span>
    </button>
  );
}

export { QuickActionButton };
