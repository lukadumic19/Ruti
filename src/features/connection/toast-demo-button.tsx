"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ToastDemoButton() {
  const t = useTranslations("health");
  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast(t("toastExampleTitle"), { description: t("toastExampleBody") })
      }
    >
      {t("toastButton")}
    </Button>
  );
}
