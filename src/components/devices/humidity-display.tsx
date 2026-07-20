"use client";

import * as React from "react";
import { Droplets } from "lucide-react";

import { SensorValue } from "@/components/devices/sensor-value";

interface HumidityDisplayProps {
  label: string;
  valuePct: number | null;
  stale?: boolean;
  loading?: boolean;
  className?: string;
}

/** Luftfugtighedsvisning i % uden decimaler. */
function HumidityDisplay({
  label,
  valuePct,
  stale,
  loading,
  className,
}: HumidityDisplayProps) {
  return (
    <SensorValue
      label={label}
      value={valuePct}
      unit="%"
      decimals={0}
      icon={Droplets}
      {...(stale !== undefined ? { stale } : {})}
      {...(loading !== undefined ? { loading } : {})}
      {...(className !== undefined ? { className } : {})}
    />
  );
}

export { HumidityDisplay };
