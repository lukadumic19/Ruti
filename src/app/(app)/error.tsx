"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/states/error-state";

/** Fejlgrænse for alle app-sider (Next error boundary). */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Kun konsollog i denne fase; struktureret logning kommer med BFF'en.
    console.error(error);
  }, [error]);

  return <ErrorState onRetry={reset} />;
}
