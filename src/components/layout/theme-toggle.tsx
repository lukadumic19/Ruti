"use client";

import * as React from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

const order = ["system", "light", "dark"] as const;
type ThemeChoice = (typeof order)[number];

/** Skifter cyklisk system → lyst → mørkt (systemtema er standard). */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("header");
  const mounted = useMounted();

  const current: ThemeChoice = order.includes(theme as ThemeChoice)
    ? (theme as ThemeChoice)
    : "system";
  const next = order[(order.indexOf(current) + 1) % order.length] ?? "system";

  const labels: Record<ThemeChoice, string> = {
    system: t("themeSystem"),
    light: t("themeLight"),
    dark: t("themeDark"),
  };
  const icons: Record<ThemeChoice, React.ReactNode> = {
    system: <SunMoon aria-hidden="true" />,
    light: <Sun aria-hidden="true" />,
    dark: <Moon aria-hidden="true" />,
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={`${t("themeToggle")} – ${labels[current]}`}
      title={labels[current]}
    >
      {/* Ikonet afhænger af klientens gemte tema og må først vises efter mount */}
      {mounted ? icons[current] : <SunMoon aria-hidden="true" />}
    </Button>
  );
}
