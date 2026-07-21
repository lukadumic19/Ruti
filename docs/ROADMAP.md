# Roadmap – Atlas Home

Faserne er sekventielle; en fase er færdig, når dens exit-kriterier er opfyldt.
**Denne fase (F0) afsluttes med dette dokumentsæt – F1 påbegyndes ikke automatisk.**

## F0 – Fundament (denne fase) ✅

Leverance: dokumentsættet i `docs/`, README, `.env.example`, mappeskelet, ADR-format.
Exit: dokumenterne dækker domænemodel, integrationsgrænser, sikkerhed, mock- og
teststrategi, og beslutningerne er logget i DECISIONS.md.

## F1 – Scaffold + mocktilstand + kerne-UI 🔨 (scaffold leveret)

> Status 2026-07-20: Grundstrukturen er på plads – Next.js/TS strict/Tailwind/
> shadcn-primitiver, app-skal med navigation og temaer, i18n (da), env-validering,
> demo-tilstands-konfiguration, PWA-grundopsætning (manifest + service worker),
> loading/empty/error-komponenter, toast-system, systemstatus-side samt
> Vitest/RTL/Playwright-opsætning med kørende tests.
>
> Status 2026-07-20 (2): Designsystemet er leveret – komplet komponentbibliotek
> (DESIGN_PRINCIPLES §8) med intern referenceside på `/design-system` og
> komponenttests for kernekomponenterne.
>
> Status 2026-07-20 (3): Domænemodel + mock smart home er leveret. Stærkt typede
> domænetyper i `src/types/` (diskriminerede unions, ADR-0013),
> `HomeProvider`-adapter (ADR-0012), `MockHomeProvider` med realistisk dansk
> mock-hjem (7 rum, 14 lys, grupper, tilbehør, lås/døre/vinduer, termostater,
> sensorer, CO₂/luftkvalitet, robotstøvsuger, energimåler), deterministisk
> simulator og fuld scenariestyring (offline, lavt batteri, åbne døre,
> bevægelse, dårlig luft, forbindelsestab, latens). Intern mock-kontrolside på
> `/mock-kontrol`.
>
> Status 2026-07-20 (4): Det primære **dashboard** er bygget mod mock-provideren.
> Situationsafhængig hilsen + hjemmestatus (låst? åbent? offline? klima? luft?
> hvad er tændt?), 8 hurtighandlinger (scener) med optimistisk/bekræftende
> feedback og fejlvisning, samt statussektioner (favoritrum, aktive lamper,
> klima, luftkvalitet, sikkerhed, døre/vinduer, robotstøvsuger, energi, seneste
> hændelser, advarsler, babyoversigt når babytilstand er aktiv). Ren, testet
> afledningskerne (`features/dashboard/derive.ts`) + foreløbig kort-datamodel
> (`cards.ts`) til senere skjul/omarrangér. Mangler nu i F1: modulerne rum, lys
> og scener som selvstændige sider, samt CI-workflow.
>
> Navnenote: den oprindelige skitse kaldte adapteren `HaClient`/`MockHaClient`;
> den implementeres som `HomeProvider`/`MockHomeProvider` (ADR-0012).
> Fejlscenarier styres via mock-kontrolpanelet frem for `?mockScenario=`-URL.

- Next.js-projekt (App Router, TS strict, Tailwind, shadcn/ui, next-intl med da.json).
- `HaClient`-interface + `MockHaClient` med seed + simulator + `?mockScenario=`.
- App-skal: navigation (mobil/tablet/desktop), forbindelsesbanner, loading/empty/error-komponenter.
- Moduler: **dashboard, rum, lys, scener** (aktivering m. trinresultat), forbindelsesstatus, demo-badge.
- CI: lint, typecheck, vitest, build, gitleaks, token-leak-scan; Playwright-flows 1–4.
- Exit: alle F1-flows kører i demo uden HA; kvalitetsporte grønne.

## F2 – Resten af modulerne (fortsat mock)

- Sensorer, dørlås (+PIN), dør-/vinduessensorer, varme, luftkvalitet,
  robotstøvsuger, energi (inkl. historikgrafer), in-app-notifikationer + regler.
- **Babytilstand komplet** (side + tilstand + hændelser via BFF-persistens).
- Familie/roller + enhedsparring, indstillinger, enhedsadministration.
- Exit: alle FEATURE_REQUIREMENTS-"skal"-krav opfyldt i demo; e2e-flows 5–10 grønne.

## F3 – Rigtig Home Assistant-integration

- `RealHaClient`: REST-snapshot, WS-events, SSE-broadcast, reconnect/resync.
- Opsætningsguide (URL + token) for Voksen; area-import; curation mod rigtige entiteter.
- HA-i-Docker-kontrakttests; fixtures opdateres; minimums-HA-version fastlåses.
- Genbesøg ADR-0007 (area-opslag) med virkelige data.
- Exit: skift demo↔rigtig HA er ren konfiguration; kontrakttests grønne natligt.

## F4 – PWA, vægpanel og polish

- Serwist service worker: installérbar, offline-læsetilstand, app-ikoner/splash.
- Vægpanel-tilstand, nattetema-automatik, performance-budget (Lighthouse CI).
- Web Push-notifikationer. Aksecheck-hærdning.
- Exit: PWA kører som dagligt vægpanel hos familien ("dogfooding-gate").

## F5 – Capacitor (iOS/Android)

- `DirectHaClient` (LAN-transport, token i Secure Storage), statisk app-shell-build.
- Capacitor-projekter, native push, App Store/TestFlight-pipeline.
- Exit: appen kører på iPhone/iPad fra TestFlight mod familiens HA.

## Tværgående milepæle

| Milepæl                          | Kriterium                                 |
| -------------------------------- | ----------------------------------------- |
| M1 "Demo-klar"                   | F1 exit – kan vises frem på enhver laptop |
| M2 "Funktionskomplet web (mock)" | F2 exit                                   |
| M3 "Virker mod huset"            | F3 exit                                   |
| **M4 "v1 web"**                  | Definition of Done nedenfor               |
| M5 "I lommen"                    | F5 exit                                   |

## 4. Definition of Done – første webversion (M4)

1. Alle "skal"-krav i FEATURE_REQUIREMENTS opfyldt mod både mock og rigtig HA.
2. Alle e2e-kerneflows (TEST_STRATEGY §4) + kontrakttests grønne i CI.
3. Ingen token i klient-bundle (automatiseret scan) og gitleaks ren.
4. WCAG AA-aksecheck uden fejl på alle sider; fungerer på 375/820/1280 px.
5. TTI < 2 s på tablet-profil; offline-læsetilstand fungerer.
6. Al UI-tekst via i18n-nøgler (lint-håndhævet); dansk komplet.
7. README-opsætningsguide efterprøvet af et ikke-teknisk familiemedlem.
8. DECISIONS.md/ADR'er ajour; ingen kendte kritiske eller høje fejl åbne.
