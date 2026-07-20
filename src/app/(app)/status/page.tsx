import { CircleCheck, FlaskConical, Radio } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ToastDemoButton } from "@/features/connection/toast-demo-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { serverEnv } from "@/config/env";
import { clientEnv } from "@/config/env";
import { appVersion } from "@/config/version";

/* Læser runtime-miljø og skal derfor ikke prerendres statisk. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("health");
  return { title: t("title") };
}

/** Health-check-side: tilstand, version og konfiguration – i menneskesprog. */
export default async function StatusPage() {
  const t = await getTranslations("health");
  const env = serverEnv();
  const demo = env.APP_MODE === "demo";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} description={t("subtitle")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {demo ? (
                <FlaskConical
                  aria-hidden="true"
                  className="size-4 text-warning"
                />
              ) : (
                <Radio aria-hidden="true" className="size-4 text-success" />
              )}
              {t("modeCard")}
              <Badge variant={demo ? "warning" : "success"}>
                {demo ? t("modeDemo") : t("modeLive")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {demo ? t("modeDemoDescription") : t("modeLiveDescription")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("appCard")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">{t("version")}</dt>
              <dd>{appVersion}</dd>
              <dt className="text-muted-foreground">{t("environment")}</dt>
              <dd>{clientEnv.NEXT_PUBLIC_APP_ENV}</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("envCard")}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* serverEnv() kaster ved ugyldig konfiguration, så når siden
                renderes, er valideringen bestået. */}
            <p className="flex items-center gap-2 text-sm">
              <CircleCheck aria-hidden="true" className="size-4 text-success" />
              {t("envOk")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("toastCard")}</CardTitle>
            <CardDescription>{t("toastDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ToastDemoButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
