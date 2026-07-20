import {
  Activity,
  ChevronRight,
  FlaskConical,
  Hammer,
  Palette,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("more");
  return { title: t("title") };
}

export default async function MorePage() {
  const t = await getTranslations("more");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} />
      <Card>
        <CardContent className="p-0">
          <Link
            href="/status"
            className="flex min-h-14 items-center gap-3 px-5 py-3 hover:bg-muted"
          >
            <Activity
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">{t("statusLink")}</span>
              <span className="truncate text-sm text-muted-foreground">
                {t("statusDescription")}
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
          </Link>
          <div className="mx-5 h-px bg-border" />
          <Link
            href="/design-system"
            className="flex min-h-14 items-center gap-3 px-5 py-3 hover:bg-muted"
          >
            <Palette
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">{t("designSystemLink")}</span>
              <span className="truncate text-sm text-muted-foreground">
                {t("designSystemDescription")}
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
          </Link>
          <div className="mx-5 h-px bg-border" />
          <Link
            href="/mock-kontrol"
            className="flex min-h-14 items-center gap-3 px-5 py-3 hover:bg-muted"
          >
            <FlaskConical
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">{t("mockPanelLink")}</span>
              <span className="truncate text-sm text-muted-foreground">
                {t("mockPanelDescription")}
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
          </Link>
        </CardContent>
      </Card>
      <EmptyState
        icon={Hammer}
        title={t("comingTitle")}
        description={t("comingDescription")}
      />
    </div>
  );
}
