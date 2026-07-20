import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * PWA-grundopsætning (ROADMAP F4 udbygger med offline-læsetilstand).
 * defaultCache giver fornuftig caching af statiske assets; API-kald
 * (/api/*) er network-first, så enhedsdata aldrig er unødigt forældede.
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
