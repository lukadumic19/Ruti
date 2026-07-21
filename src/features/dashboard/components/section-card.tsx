"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  /** Valgfrit link i kortets overskrift (fx til fuld modulside). */
  href?: string;
  /** Element i højre side af overskriften (fx en samlet status-badge). */
  headerRight?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Fælles ramme om et dashboard-kort: titel, valgfrit ikon og link. */
export function SectionCard({
  title,
  icon: Icon,
  href,
  headerRight,
  className,
  children,
}: SectionCardProps) {
  const heading = (
    <span className="flex items-center gap-2">
      {Icon ? (
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      ) : null}
      {title}
    </span>
  );

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-sm">
          {href ? (
            <Link
              href={href}
              className="flex items-center gap-1 hover:text-primary"
            >
              {heading}
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          ) : (
            heading
          )}
        </CardTitle>
        {headerRight}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}
