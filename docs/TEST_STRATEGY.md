# Teststrategi – Atlas Home

## 1. Pyramide og værktøjer

| Lag       | Værktøj                                           | Omfang                                                                                       | Kører                                    |
| --------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Unit      | Vitest                                            | Mapping-funktioner (HA→domæne), Zod-skemaer, sceneudførelse, regel-evaluering, stores, utils | Hver commit (hurtig, < 30 s)             |
| Komponent | Vitest + React Testing Library                    | Kort, dialoger, states (loading/empty/error), rollebaseret rendering                         | Hver commit                              |
| E2E       | Playwright                                        | Kerneflows mod appen i mocktilstand                                                          | PR + main                                |
| Kontrakt  | Vitest mod HA i Docker                            | `RealHaClient` mod rigtig HA (demo-platform)                                                 | Fase 3+, natligt + PR der rører `lib/ha` |
| Statisk   | ESLint, `tsc --noEmit`, gitleaks, token-leak-scan | Hele repoet                                                                                  | Hver commit                              |

Kommandoer (fastlægges i Fase 1-scaffold): `pnpm lint`, `pnpm typecheck`,
`pnpm test`, `pnpm test:e2e`, `pnpm build`. CI kører alle på PR.

## 2. Hvad der SKAL unit-testes (100 % af grenene)

- `HaEntity → Device`-mapping pr. DeviceKind, inkl. defekte payloads → `unsupported`.
- `DeviceCommand → HA service call`-oversættelse inkl. whitelist-afvisning.
- Sceneudførelse: parallelle trin, delvis fejl, resultataggregering.
- Regel-evaluering (§DATA_MODEL 7) inkl. `forMin`-tidslogik (fake timers).
- Rolle-/PIN-håndhævelse i BFF-endpoints (FORBIDDEN/PIN_REQUIRED-stier).
- Env-validering: manglende/ugyldige variabler fejler ved opstart med klar besked.

## 3. Mock-strategi (fundamentet for al test)

- **Én kilde:** `MockHomeProvider` + `seed.ts` (`src/lib/mock/`) bruges af
  dev-server, Playwright og enkelttests. `buildMockHome()` konstruerer det
  typesikre danske mock-hjem; provideren bygger alt state ovenpå. Implementeret
  i F1 (ADR-0012/0013).
- **Simulator:** deterministisk med seedet RNG (`rng.ts`, mulberry32) og fake
  clock (`vi.useFakeTimers()`), så både unit-tests og e2e er stabile.
- **Fejlscenarier** styres via `MockScenarioController` (mock-kontrolpanelet,
  `/mock-kontrol`): forbindelsestab (permanent/kortvarigt), enhed offline,
  lavt batteri, åben dør/vindue, bevægelse, dårlig luftkvalitet, fastklemt lås
  og kommandolatens. I unit-tests kaldes controlleren direkte. (Den oprindeligt
  skitserede `?mockScenario=`-URL erstattes af denne rigere, interaktive kontrol.)
- **Fixtures:** optagne, anonymiserede HA-payloads i `src/lib/ha/__fixtures__/`
  er kontrakten mellem unit-tests og virkeligheden; oprettes i Fase 3 mod rigtig HA.

## 4. E2E-kerneflows (Playwright, mod mocktilstand)

1. Dashboard indlæses → viser scener, indeklima, låsestatus (mobil + tablet viewport).
2. "Godnat" aktiveres med 2 tryk → trinliste vises → mock-state ændres.
3. Delvis scenefejl (`partial-scene-failure`) → ✗ på trin + retry virker.
4. Lys: tænd/sluk + lysstyrke fra rumside; rollback ved `device-unavailable`.
5. Oplåsning: kræver Voksen + PIN; forkert PIN 5× → lockout-besked.
6. `ha-offline` → banner, cached data med tidsstempel, kommandoer deaktiveret.
7. `ws-drop` → "Genopretter…" → automatisk resync uden reload.
8. Babytilstand: aktivér → nattetema; registrér måltid → "for 0 min. siden";
   bagudregistrering virker.
9. Enhedsadministration: omdøb + skjul enhed → afspejles på dashboard.
10. Rolleskift til Barn → lås og indstillinger er væk (og API afviser, testet via request-interception).

Viewports: 375×667, 820×1180, 1280×800. Aksecheck (axe-core) køres på hver side i flow 1.

## 5. Kontrakttest mod rigtig HA (Fase 3)

- Docker-compose starter HA med `demo:`-platform + kendt konfiguration.
- Suite verificerer: auth-flow, snapshot-parse (ingen `unsupported` for kendte
  domæner), service calls ændrer state, WS-reconnect efter container-restart.
- Formålet er at fange HA-versionsskred; kører natligt og ved ændringer i `lib/ha`.

## 6. Ikke-funktionelle tests

- **Performance-budget** (Lighthouse CI i Fase 4): TTI < 2 s på throttled tablet-profil, bundle < 300 kB gzip for dashboard-ruten.
- **PWA:** installérbarhed + offline-læsetilstand testes i Playwright (service worker + `context.setOffline(true)`).

## 7. Sikkerhedstests (automatiserede, jf. SECURITY_MODEL §3)

- Token-leak-scan af `.next/static/**` efter build (fejler builden).
- gitleaks i CI.
- E2E: uparret klient får 401 på alle `/api/ha/*`; Barn-session får 403 på lås-kommando.

## 8. Definition af "testet" for en PR

En feature-PR er først færdig, når: nye grene er unit-testede, berørte
komponenters tre tilstande (loading/empty/error) har komponenttests, eventuelle
nye kerneflows har et e2e-scenarie, og alle kvalitetsporte (lint, typecheck,
test, build) er grønne.
