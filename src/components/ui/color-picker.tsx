"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { lightColorPresets } from "@/config/light-colors";
import { cn } from "@/lib/utils/cn";

interface ColorPickerProps {
  /** Valgt preset-id fra lightColorPresets, eller null for intet valg. */
  value: string | null;
  onValueChange: (presetId: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Farvevælger med kurateret palette (FEATURE_REQUIREMENTS §3: presets,
 * ikke farvehjul). Radiogruppe-semantik; valget markeres med flueben og
 * navnet står under hver farve – aldrig kun farve.
 */
function ColorPicker({
  value,
  onValueChange,
  disabled,
  className,
}: ColorPickerProps) {
  const t = useTranslations("controls");
  const tColors = useTranslations("lightColors");
  return (
    <RadioGroupPrimitive.Root
      aria-label={t("colorLabel")}
      value={value ?? ""}
      onValueChange={onValueChange}
      {...(disabled !== undefined ? { disabled } : {})}
      className={cn(
        "grid grid-cols-3 gap-2 data-[disabled]:opacity-50 sm:grid-cols-6",
        className,
      )}
    >
      {lightColorPresets.map((preset) => (
        <RadioGroupPrimitive.Item
          key={preset.id}
          value={preset.id}
          className="group flex min-h-11 flex-col items-center gap-1.5 rounded-md p-2 hover:bg-muted"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full border border-border"
            style={{ backgroundColor: preset.hex }}
          >
            <RadioGroupPrimitive.Indicator>
              {/* Mørkt flueben på lys baggrundsskive, så det ses på alle farver */}
              <span className="flex size-5 items-center justify-center rounded-full bg-card/90">
                <Check
                  aria-hidden="true"
                  className="size-3.5 text-foreground"
                />
              </span>
            </RadioGroupPrimitive.Indicator>
          </span>
          <span className="text-xs text-muted-foreground group-data-[state=checked]:font-medium group-data-[state=checked]:text-foreground">
            {tColors(preset.nameKey)}
          </span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}

export { ColorPicker };
