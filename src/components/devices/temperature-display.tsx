"use client";

import * as React from "react";
import { Thermometer } from "lucide-react";

import { SensorValue } from "@/components/devices/sensor-value";

interface TemperatureDisplayProps {
  label: string;
  valueC: number | null;
  stale?: boolean;
  loading?: boolean;
  className?: string;
}

/** Temperaturvisning i °C med én decimal (da-DK). */
function TemperatureDisplay({
  label,
  valueC,
  stale,
  loading,
  className,
}: TemperatureDisplayProps) {
  return (
    <SensorValue
      label={label}
      value={valueC}
      unit="°C"
      decimals={1}
      icon={Thermometer}
      {...(stale !== undefined ? { stale } : {})}
      {...(loading !== undefined ? { loading } : {})}
      {...(className !== undefined ? { className } : {})}
    />
  );
}

export { TemperatureDisplay };
