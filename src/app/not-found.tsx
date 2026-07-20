import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const tNotFound = await getTranslations("notFound");
  const tStates = await getTranslations("states");
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-5xl font-semibold text-muted-foreground">404</p>
      <h1 className="text-xl font-semibold">{tNotFound("title")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {tNotFound("description")}
      </p>
      <Button asChild variant="secondary" className="mt-2">
        <Link href="/">{tStates("goHome")}</Link>
      </Button>
    </div>
  );
}
