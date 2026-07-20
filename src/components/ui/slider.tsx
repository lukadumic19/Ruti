"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils/cn";

interface SliderProps extends React.ComponentProps<
  typeof SliderPrimitive.Root
> {
  /** Tilgængeligt navn for tommelfingeren (kræves, da slideren sjældent har synlig label tæt på). */
  thumbLabel: string;
  /** Menneskelæsbar værdi til skærmlæsere, fx "80 %" eller "2700 K – varmt lys". */
  valueText?: string;
  /** Valgfri styling af selve sporet (bruges af farvetemperaturvælgeren). */
  trackClassName?: string;
  rangeClassName?: string;
}

/** Slider med stor trykflade (py-3 giver ≥44 px vertikalt hit-område). */
function Slider({
  className,
  thumbLabel,
  valueText,
  trackClassName,
  rangeClassName,
  ...props
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none items-center py-3 select-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative h-2.5 w-full grow overflow-hidden rounded-full bg-muted",
          trackClassName,
        )}
      >
        <SliderPrimitive.Range
          className={cn("absolute h-full bg-primary", rangeClassName)}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={thumbLabel}
        {...(valueText ? { "aria-valuetext": valueText } : {})}
        className="block size-7 rounded-full border border-border bg-card shadow-md transition-colors hover:bg-muted"
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };
