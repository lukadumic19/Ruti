import { Shield, Sparkles, Thermometer } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * Placeholder-dashboard (denne fase). Den rigtige dashboardfunktion med
 * scener, favoritter og live-data bygges senere i Fase 1 (ROADMAP F1).
 */
export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  const cards = [
    {
      title: t("scenesCard"),
      icon: Sparkles,
      emptyTitle: t("scenesEmptyTitle"),
      emptyDescription: t("scenesEmptyDescription"),
    },
    {
      title: t("climateCard"),
      icon: Thermometer,
      emptyTitle: t("climateEmptyTitle"),
      emptyDescription: t("climateEmptyDescription"),
    },
    {
      title: t("securityCard"),
      icon: Shield,
      emptyTitle: t("securityEmptyTitle"),
      emptyDescription: t("securityEmptyDescription"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("subtitle")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={card.icon}
                title={card.emptyTitle}
                description={card.emptyDescription}
                className="py-6"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
