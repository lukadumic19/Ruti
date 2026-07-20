"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { isNavItemActive, navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils/cn";

/** Bundnavigation til mobil (< 640 px). Trykflader min. 44 px + safe-area. */
export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      aria-label={t("mainNavLabel")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {navItems.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs",
                  active
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
