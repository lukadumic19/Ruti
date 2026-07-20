"use client";

import * as React from "react";
import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";

interface ConfirmationFeedbackProps {
  /** Fx "Godnat er aktiveret". Udelades → generisk "Udført". */
  message?: string;
  className?: string;
}

/**
 * Inline-bekræftelse efter en gennemført handling (fx sceneaktivering).
 * aria-live="polite" annoncerer resultatet for skærmlæsere; blid ind-animation
 * (slås fra ved prefers-reduced-motion via global CSS).
 * Trivielle handlinger med synligt resultat skal IKKE bekræftes
 * (DESIGN_PRINCIPLES §7) – brug kun denne, hvor resultatet ellers er usynligt.
 */
function ConfirmationFeedback({
  message,
  className,
}: ConfirmationFeedbackProps) {
  const t = useTranslations("feedback");
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex animate-in items-center gap-1.5 text-sm font-medium text-success fade-in-0 slide-in-from-bottom-1",
        className,
      )}
    >
      <CircleCheck aria-hidden="true" className="size-4.5" />
      {message ?? t("done")}
    </p>
  );
}

export { ConfirmationFeedback };
