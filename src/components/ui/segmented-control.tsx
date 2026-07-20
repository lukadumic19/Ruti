"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Tilgængeligt navn for hele gruppen. */
  label: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Segmented control bygget som radiogruppe (korrekt semantik + piletaster).
 * Valgt segment markeres med kort-baggrund og fed tekst – ikke kun farve.
 */
function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  label,
  disabled,
  className,
}: SegmentedControlProps<T>) {
  return (
    <RadioGroupPrimitive.Root
      aria-label={label}
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
      {...(disabled !== undefined ? { disabled } : {})}
      orientation="horizontal"
      className={cn(
        "inline-flex w-full gap-1 rounded-lg bg-muted p-1 data-[disabled]:opacity-50",
        className,
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:text-foreground data-[state=checked]:bg-card data-[state=checked]:font-medium data-[state=checked]:text-foreground data-[state=checked]:shadow-sm"
          >
            {Icon ? <Icon aria-hidden="true" className="size-4" /> : null}
            {option.label}
          </RadioGroupPrimitive.Item>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}

export { SegmentedControl };
