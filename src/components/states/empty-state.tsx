import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

/** Generisk tom-tilstand (TECHNICAL_ARCHITECTURE §8: alle sider har empty state). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-10 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon aria-hidden="true" className="size-6 text-muted-foreground" />
        </div>
      ) : null}
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? (
        <Button variant="secondary" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
