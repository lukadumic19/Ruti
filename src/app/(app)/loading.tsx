import { useTranslations } from "next-intl";

import { PageSkeleton } from "@/components/states/page-skeleton";

export default function Loading() {
  const t = useTranslations("states");
  return <PageSkeleton label={t("loading")} />;
}
