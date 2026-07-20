"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { isNavItemActive, navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils/cn";

/** Sidenavigation til tablet/desktop (≥ 640 px), jf. DESIGN_PRINCIPLES §2. */
export function SideNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      aria-label={t("mainNavLabel")}
      className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-20 shrink-0 border-r border-border sm:block lg:w-56"
    >
      <ul className="flex flex-col gap-1 p-2 lg:p-3">
        {navItems.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center gap-1 rounded-md px-2 py-2 text-xs lg:flex-row lg:gap-3 lg:px-3 lg:text-sm",
                  active
                    ? "bg-muted font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
