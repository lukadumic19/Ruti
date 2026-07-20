import * as React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { branding } from "@/config/branding";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface HeaderProps {
  demoMode: boolean;
}

export async function Header({ demoMode }: HeaderProps) {
  const t = await getTranslations("header");
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 font-semibold tracking-tight"
        >
          {branding.appName}
        </Link>
        <div className="flex items-center gap-2">
          {demoMode ? (
            <Badge variant="warning" title={t("demoBadgeHint")}>
              {t("demoBadge")}
            </Badge>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
