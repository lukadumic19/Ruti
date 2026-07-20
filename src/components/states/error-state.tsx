"use client";

import * as React from "react";
import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/** Generisk fejlvisning med valgfri "Prøv igen" (TECHNICAL_ARCHITECTURE §8). */
export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  const t = useTranslations("states");
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive-soft">
        <CircleAlert aria-hidden="true" className="size-6 text-destructive" />
      </div>
      <p className="font-medium">{title ?? t("errorTitle")}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {description ?? t("errorDescription")}
      </p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry} className="mt-1">
          {t("retry")}
        </Button>
      ) : null}
    </div>
  );
}
