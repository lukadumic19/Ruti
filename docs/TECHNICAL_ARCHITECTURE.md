# Teknisk arkitektur – Atlas Home

Dette dokument er den bindende reference for arkitekturafgørelser i kodebasen.
Ændringer kræver en ADR (se `docs/adr/ADR-TEMPLATE.md`).

## 1. Overblik

```
┌────────────────────────────── Klient (browser / PWA / senere Capacitor) ─────┐
│  Next.js App Router (React, TypeScript strict)                               │
│  ┌────────────┐  ┌───────────────┐  ┌─────────────────────────────────────┐  │
│  │ UI-lag     │  │ Feature-lag   │  │ Datalag                             │  │
│  │ shadcn/ui  │←→│ dashboard,    │←→│ TanStack Query (serverstate)        │  │
│  │ Tailwind   │  │ rum, lys, ... │  │ Zustand (UI-state)                  │  │
│  └────────────┘  └───────────────┘  │ HaClient-interface (se §5)          │  │
│                                     └───────────────┬─────────────────────┘  │
└─────────────────────────────────────────────────────┼────────────────────────┘
                                          fetch / SSE │ (aldrig token her)
┌─────────────────────────────────────────────────────▼────────────────────────┐
│  BFF: Next.js Route Handlers (/api/ha/*)  – kører på lokal server            │
│  - Har HA_TOKEN som miljøvariabel (kun serverside)                           │
│  - Proxy for REST-kald + holder én WebSocket til HA, re-broadcaster via SSE  │
│  - Zod-validering af alt der krydser grænsen                                 │
│  - MockClient-implementering når APP_MODE=demo                               │
└─────────────────────────────────────────────────────┬────────────────────────┘
                                       REST + WS       │ (Bearer-token)
                              ┌────────────────────────▼───────────────────────┐
                              │  Home Assistant (lokalt LAN)                   │
                              └────────────────────────────────────────────────┘
```

Nøglebeslutning (ADR-0002): Klienten taler **aldrig** direkte med Home Assistant
i webversionen. Al kommunikation går gennem BFF'en, som er den eneste indehaver
af tokenet. I Capacitor-fasen erstattes BFF-transporten af en direkte
LAN-transport med token i native secure storage – bag samme `HaClient`-interface
(se §11).

## 2. Teknologistak (vurderet)

| Valg                               | Status      | Begrundelse                                                                                                                  |
| ---------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Next.js (App Router)               | ✅ Valgt    | BFF/Route Handlers løser token-problemet elegant; stærkt PWA-økosystem; statisk eksport mulig for Capacitor-fasen            |
| React 18+                          | ✅ Valgt    | Følger med Next.js; størst økosystem for komponentbibliotek                                                                  |
| TypeScript strict                  | ✅ Valgt    | `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`                                         |
| Tailwind CSS                       | ✅ Valgt    | Design-tokens i config; hurtig responsivitet                                                                                 |
| shadcn/ui (Radix-baseret)          | ✅ Valgt    | Tilgængeligt (a11y), kopieres ind i repo → fuld kontrol, ingen runtime-afhængighed                                           |
| Zustand                            | ✅ Valgt    | Kun til UI-state (aktiv side, dialoger, babytilstands-lokal state). Ikke serverdata                                          |
| TanStack Query                     | ✅ Valgt    | Al HA-data er serverstate: caching, retry, invalidering, optimistiske opdateringer. WS/SSE-events skrives ind i query-cachen |
| Zod                                | ✅ Valgt    | Runtime-validering ved integrationsgrænsen (HA-payloads er ikke typesikre)                                                   |
| Vitest + RTL                       | ✅ Valgt    | Unit + komponent                                                                                                             |
| Playwright                         | ✅ Valgt    | E2E mod mocktilstand                                                                                                         |
| PWA (Serwist)                      | ✅ Valgt    | `next-pwa` er dårligt vedligeholdt; Serwist er efterfølgeren (ADR-0005)                                                      |
| next-intl                          | ✅ Valgt    | Dansk som eneste locale i v1, men beskednøgler + ICU fra dag ét                                                              |
| Capacitor                          | ⏳ Fase 5   | Se §11                                                                                                                       |
| Redux, tRPC, GraphQL, ORM/database | ❌ Fravalgt | Unødvendig kompleksitet – HA er datakilden; appens egen persistens er små JSON-filer/localStorage i v1                       |

## 3. Foreløbig mappestruktur

Strukturen er oprettet som skelet i repoet (`.gitkeep`-filer). Kode kommer i Fase 1.

```
/
├── docs/                     # Denne dokumentation + ADR'er
│   └── adr/
├── public/                   # Ikoner, manifest, statiske assets
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (app)/            # Autentificerede app-sider: dashboard, rum/[id], baby, ...
│   │   └── api/ha/           # BFF Route Handlers (proxy, SSE-stream)
│   ├── components/           # Genbrugelige UI-komponenter
│   │   ├── ui/               # Primitiver i shadcn/ui-stil (button, card, badge, …)
│   │   ├── layout/           # App-skal: header, navigation, page-header
│   │   └── states/           # Generisk empty/error/skeleton
│   ├── features/             # Ét modul pr. domæne (se §6)
│   │   ├── dashboard/
│   │   ├── rooms/
│   │   ├── lights/
│   │   ├── scenes/
│   │   ├── climate/
│   │   ├── security/         # dørlås + dør-/vinduessensorer
│   │   ├── air-quality/
│   │   ├── vacuum/
│   │   ├── energy/
│   │   ├── notifications/
│   │   ├── automations/
│   │   ├── baby/
│   │   ├── family/           # brugerroller
│   │   ├── settings/
│   │   └── connection/       # forbindelsesstatus + demo-tilstand
│   ├── lib/
│   │   ├── ha/               # HaClient-interface, RealHaClient, typer, zod-skemaer
│   │   ├── mock/             # MockHaClient, seed-data, scenarie-simulator
│   │   └── utils/
│   ├── hooks/                # Genbrugelige React-hooks (use-mounted, …)
│   ├── stores/               # Zustand-stores (kun UI-state)
│   ├── config/               # branding.ts, env.ts (zod), storage.ts, version.ts
│   ├── i18n/                 # config.ts, request.ts, messages/da.json (+ fremtidige)
│   ├── styles/               # globals.css med semantiske design-tokens
│   ├── sw.ts                 # Serwist service worker
│   └── types/                # Delte domænetyper (se DATA_MODEL.md)
├── tests/
│   ├── e2e/                  # Playwright
│   ├── setup.ts              # Vitest-setup (jest-dom, cleanup)
│   └── test-utils.tsx        # renderWithIntl m.m.
├── .env.example
└── README.md
```

Regler:

- `features/*` må importere fra `lib`, `components`, `stores`, `types` – aldrig fra andre features (undtagen via eksplicit eksporteret public API i featurens `index.ts`).
- `lib/ha` kender intet til React. `lib/mock` implementerer samme interface som `lib/ha`.
- `app/` indeholder kun routing/komposition – ingen forretningslogik.

## 4. Dataflow

**Læsning (state):**

1. Klient kalder `GET /api/ha/state` (initial snapshot) → BFF henter/cacher fra HA REST (`/api/states`) eller MockClient → Zod-parser → mapper til domænemodel (DATA_MODEL.md) → JSON til klient.
2. Klient åbner `GET /api/ha/events` (SSE). BFF holder én WebSocket til HA (`state_changed`-events), mapper til domæne-events og streamer dem.
3. TanStack Query holder snapshottet i cachen; SSE-events patcher cachen (`setQueryData`). Fallback ved SSE-fejl: polling hvert 10. sekund + statusbanner.

**Skrivning (kommandoer):**

1. Klient kalder `POST /api/ha/command` med en typet kommando (fx `{ type: "light.set", deviceId, on: true, brightness: 80 }`).
2. BFF oversætter til HA service call (`light.turn_on` m.m.), validerer med Zod, videresender.
3. Klienten opdaterer optimistisk; bekræftelse kommer som `state_changed`-event. Hvis eventet udebliver efter 5 s → rul tilbage + fejltoast (se §8).

**SSE frem for WebSocket klient↔BFF (ADR-0003):** SSE er simplere, genforbinder automatisk, fungerer gennem proxier og dækker behovet (server→klient-push; klient→server går via almindelige POSTs).

## 5. HaClient-interfacet (integrationsgrænsen)

Én TypeScript-interface, to implementeringer. Al app-kode afhænger kun af interfacet.

```ts
interface HaClient {
  getSnapshot(): Promise<HomeSnapshot>; // alle enheder + tilstande
  subscribe(cb: (e: DeviceEvent) => void): Unsubscribe;
  sendCommand(cmd: DeviceCommand): Promise<CommandResult>;
  getHistory(q: HistoryQuery): Promise<HistoryResult>; // energi/klima
  connectionState$: Observable<ConnectionState>; // 'connected' | 'reconnecting' | 'offline' | 'demo'
}
```

- `RealHaClient` (kører i BFF): REST + WebSocket mod HA, token fra env.
- `MockHaClient` (kører i BFF når `APP_MODE=demo`): seed-data + simulator (se §10).
- Valget sker ét sted: `src/lib/ha/createClient.ts` ud fra `env.APP_MODE`.

Detaljer om HA-endpoints, autentificering og entity-mapping: HOME_ASSISTANT_INTEGRATION.md.

## 6. Udvidbarhed: enhedstype-registret

Nye enhedstyper tilføjes ved at registrere én modulbeskrivelse – uden at ændre kernen:

```ts
// src/config/device-registry.ts
registerDeviceType({
  kind: "vacuum",
  haDomains: ["vacuum"], // hvilke HA-domæner mappes hertil
  parse: vacuumSchema.parse, // Zod: HA-attributter → domænemodel
  commands: vacuumCommands, // typede kommandoer → HA service calls
  card: VacuumCard, // kort-komponent til dashboard/rum
  detail: VacuumDetail, // detaljeside (valgfri)
  icon: VacuumIcon,
});
```

Ukendte HA-entiteter ignoreres (logges i udviklertilstand) – de vises aldrig rå for brugeren.

## 7. State management – ansvarfordeling

| State                                                | Ejer                             | Persistens                                                    |
| ---------------------------------------------------- | -------------------------------- | ------------------------------------------------------------- |
| Enhedstilstande, scener, historik                    | TanStack Query (via HaClient)    | Query-cache; persistes til `localStorage` for offline-læsning |
| UI: aktiv fane, åbne dialoger, tablet-tilstand       | Zustand                          | Ingen (session)                                               |
| Brugerprofil/rolle, tema, babytilstand-konfiguration | Zustand med `persist`-middleware | `localStorage`                                                |
| Baby-hændelser (måltid, bleskift)                    | TanStack Query mod BFF-endpoint  | JSON-fil på server i v1 (se DATA_MODEL §6)                    |
| Hemmeligheder (HA-token)                             | Kun BFF-processens env           | Aldrig i klient                                               |

## 8. Fejlscenarier og offlineadfærd (bindende)

| Scenarie                      | Detektion                                            | Adfærd                                                                                                                                                                                           |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HA utilgængelig ved opstart   | Snapshot-fetch fejler                                | Vis cached sidste kendte tilstand (med tidsstempel "Sidst opdateret kl. …") + rødt statusbanner. Kommandoknapper deaktiveres med forklaring                                                      |
| WS/SSE-forbindelse tabes      | SSE `onerror` / BFF-heartbeat (hvert 15 s) udebliver | Gult banner "Genopretter forbindelse…", eksponentiel backoff (1s→2s→4s→…→30s), fallback-polling                                                                                                  |
| Token ugyldigt/udløbet        | HA svarer 401                                        | BFF returnerer typet fejl `AUTH_FAILED`; UI viser opsætningshjælp (kun for admin-rolle) – aldrig rå fejltekst                                                                                    |
| Enkelt enhed `unavailable`    | HA-state = `unavailable`/`unknown`                   | Kortet vises nedtonet med "Ikke tilgængelig" – aldrig skjult (undgå "hvor blev lampen af?")                                                                                                      |
| Kommando-timeout              | Ingen state-bekræftelse < 5 s                        | Optimistisk UI rulles tilbage, toast: "Kunne ikke tænde Stuelampen – prøv igen"                                                                                                                  |
| Scene delvist fejlet          | En eller flere service calls fejler                  | Resultatliste pr. handling: ✓/✗, med "Prøv igen"-knap for de fejlede                                                                                                                             |
| Ugyldig HA-payload            | Zod-parse fejler i BFF                               | Enheden markeres `unsupported`, logges; appen crasher aldrig på dårlige data                                                                                                                     |
| Appen offline (klientens net) | `navigator.onLine` + fetch-fejl                      | Læsetilstand fra persisteret cache; alle skrivehandlinger blokeres synligt. Ingen kommandokø i v1 (ADR-0006: en kø der affyrer gamle lås/lys-kommandoer senere er farligere end en tydelig fejl) |

Alle sider skal have de tre standardtilstande: **loading** (skeleton), **empty**
(vejledende tom-tilstand med handling) og **error** (forklaring + retry). Genbrugelige
komponenter til disse ligger i `src/components/states/`.

## 9. Internationalisering

- Al UI-tekst i `src/i18n/da.json`, tilgået via next-intl (`t("scenes.goodnight")`).
- Ingen hårdkodede strenge i komponenter (lint-regel i Fase 1).
- Datoer/tal via `Intl` med locale `da-DK`.
- Nye sprog = ny beskedfil; ingen kodeændringer.

## 10. Mock-strategi (resumé – detaljer i TEST_STRATEGY §3)

- `MockHaClient` seedes fra `src/lib/mock/seed.ts`: et realistisk hjem med 6 rum
  og alle enhedstyper fra FEATURE_REQUIREMENTS.
- En simulator genererer liv: temperaturdrift, solopgang/-nedgang, robotstøvsuger-
  cyklus, tilfældige døråbninger, energikurver.
- Fejlscenarier kan aktiveres via `?mockScenario=`-parameter (fx `ha-offline`,
  `slow-network`, `lock-jammed`) – bruges direkte af Playwright.
- Demotilstand er en førsteklasses feature (synligt "Demo"-badge i UI), ikke et testværktøj alene.

## 11. Fremtidig mobilstrategi (Capacitor, Fase 5)

- Appen bygges fra start med `HaClient` som eneste datavej, så transporten kan
  udskiftes: i Capacitor-builden erstattes BFF-fetch af en `DirectHaClient`, der
  taler REST/WS direkte med HA på LAN, med token i **Capacitor Secure Storage**
  (iOS Keychain / Android Keystore).
- Krav der forberedes nu: ingen Node-afhængigheder i klientkode, statisk
  eksporterbar app-shell, touch-mål ≥ 44 px, safe-area-insets, ingen hover-afhængig UI.
- PWA'en er broen: den skal være installérbar og fuldt funktionel på iPad
  (vægtablettet) længe før Capacitor-fasen.

## 12. Kvalitetsporte

Enhver ændring skal bestå: `lint` → `typecheck` → `vitest` → `build` (+ Playwright
i CI på PR'er). Definition of Done for v1: se ROADMAP §4.
