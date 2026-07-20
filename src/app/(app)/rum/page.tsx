import { LayoutGrid } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("rooms");
  return { title: t("title") };
}

export default async function RoomsPage() {
  const t = await getTranslations("rooms");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} />
      <EmptyState
        icon={LayoutGrid}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
      />
    </div>
  );
}
