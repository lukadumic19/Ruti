"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Slider } from "@/components/ui/slider";
import { colorTemperature } from "@/config/light-colors";
import { cn } from "@/lib/utils/cn";

interface ColorTemperaturePickerProps {
  /** Kelvin-værdi inden for [minK, maxK]. */
  valueK: number;
  onValueChange: (kelvin: number) => void;
  disabled?: boolean;
  className?: string;
}

function describe(kelvin: number, t: (key: string) => string): string {
  if (kelvin < colorTemperature.warmBelowK) return t("colorTempWarm");
  if (kelvin > colorTemperature.coolAboveK) return t("colorTempCool");
  return t("colorTempNeutral");
}

/**
 * Farvetemperaturvælger: slider over varm→kold gradient med Kelvin-værdi
 * og sproglig beskrivelse som tekst og aria-valuetext.
 */
function ColorTemperaturePicker({
  valueK,
  onValueChange,
  disabled,
  className,
}: ColorTemperaturePickerProps) {
  const t = useTranslations("controls");
  const description = describe(valueK, t);
  const valueText = t("colorTempValue", {
    kelvin: valueK,
    name: description,
  });

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{t("colorTempLabel")}</span>
        {/* Værdien vises som tekst – gradienten er aldrig eneste informationsbærer */}
        <output aria-hidden="true" className="font-medium tabular-nums">
          {valueText}
        </output>
      </div>
      <Slider
        min={colorTemperature.minK}
        max={colorTemperature.maxK}
        step={colorTemperature.stepK}
        value={[valueK]}
        onValueChange={([v]) => {
          if (v !== undefined) onValueChange(v);
        }}
        {...(disabled !== undefined ? { disabled } : {})}
        thumbLabel={t("colorTempLabel")}
        valueText={valueText}
        trackClassName="bg-[linear-gradient(to_right,#ffb46b,#fff3e0,#cfe3ff)]"
        rangeClassName="bg-transparent"
      />
    </div>
  );
}

export { ColorTemperaturePicker };
