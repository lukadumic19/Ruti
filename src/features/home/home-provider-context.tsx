"use client";

import * as React from "react";

import type { HomeProvider } from "@/lib/ha/provider";
import { MockHomeProvider } from "@/lib/mock/mock-provider";

/**
 * Gør en HomeProvider tilgængelig for hele appen (ADR-0012).
 * I demo-tilstand instansieres MockHomeProvider i klienten; i live-tilstand
 * (Fase 3) erstattes den af en tynd provider mod BFF'en – UI'et er uændret.
 */
const HomeProviderContext = React.createContext<HomeProvider | null>(null);

export function HomeDataProvider({
  demo,
  children,
}: {
  demo: boolean;
  children: React.ReactNode;
}) {
  const [provider] = React.useState<HomeProvider | null>(() =>
    demo ? new MockHomeProvider() : null,
  );

  React.useEffect(() => {
    if (!provider) return;
    void provider.connect();
    return () => {
      void provider.disconnect();
    };
  }, [provider]);

  return (
    <HomeProviderContext.Provider value={provider}>
      {children}
    </HomeProviderContext.Provider>
  );
}

/** null når ingen datakilde er konfigureret (live-tilstand før Fase 3). */
export function useHomeProviderOrNull(): HomeProvider | null {
  return React.useContext(HomeProviderContext);
}
