import * as React from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { SideNav } from "@/components/layout/side-nav";
import { serverEnv } from "@/config/env";
import { HomeDataProvider } from "@/features/home/home-provider-context";

/** Global app-shell: header, sidenav (≥sm), bundnav (<sm) og indholdsområde. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const demoMode = serverEnv().APP_MODE === "demo";

  return (
    <HomeDataProvider demo={demoMode}>
      <div className="flex min-h-dvh flex-col">
        <Header demoMode={demoMode} />
        <div className="mx-auto flex w-full max-w-6xl flex-1">
          <SideNav />
          {/* pb-24 giver plads til bundnavigationen på mobil */}
          <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:pb-8">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </HomeDataProvider>
  );
}
