# Atlas Home

> Projektnavnet er foreløbigt og let at udskifte – se ADR-0004 i
> [docs/DECISIONS.md](docs/DECISIONS.md).

En lokal-først smart home-webapp til hele familien: dansk, enkel (1–2 tryk til
de vigtigste handlinger) og visuelt gennemført – med Home Assistant som usynlig
integrationsmotor. Udvikles først som web/PWA, senere som iOS/Android-app via
Capacitor.

**Status: Fase 1 (grundstruktur) er i gang.** Den tekniske grundstruktur kører:
app-skal med navigation, tema, i18n (dansk), design-tokens, PWA-grundopsætning,
demo-tilstand, systemstatus-side og fuld testopsætning. Kernemodulerne
(dashboard, rum, lys, scener) bygges som næste skridt
(se [docs/ROADMAP.md](docs/ROADMAP.md)).

## Dokumentation

| Dokument                                                                 | Indhold                                                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md)                         | Vision, målgruppe, kerneprincipper, succeskriterier                       |
| [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md)         | Stak, BFF-arkitektur, dataflow, state, fejl-/offlineadfærd, mappestruktur |
| [docs/FEATURE_REQUIREMENTS.md](docs/FEATURE_REQUIREMENTS.md)             | Testbare krav pr. modul (inkl. babytilstand)                              |
| [docs/SECURITY_MODEL.md](docs/SECURITY_MODEL.md)                         | Trusselsmodel, token-regler, roller, PIN                                  |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md)                                 | Domænemodeller, enhedstyper, kommandoer, persistens                       |
| [docs/HOME_ASSISTANT_INTEGRATION.md](docs/HOME_ASSISTANT_INTEGRATION.md) | REST/WS-brug, entity-mapping, fejlkoder                                   |
| [docs/DESIGN_PRINCIPLES.md](docs/DESIGN_PRINCIPLES.md)                   | UI-regler, responsivitet, a11y, vægpanel                                  |
| [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md)                           | Testpyramide, mock-strategi, e2e-flows, kvalitetsporte                    |
| [docs/ROADMAP.md](docs/ROADMAP.md)                                       | Faser F0–F5, milepæle, Definition of Done for v1                          |
| [docs/DECISIONS.md](docs/DECISIONS.md)                                   | Beslutningslog + ADR-indeks ([skabelon](docs/adr/ADR-TEMPLATE.md))        |

## Teknologistak (besluttet)

Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS · shadcn/ui ·
TanStack Query · Zustand · Zod · next-intl · Serwist (PWA) · Vitest + React
Testing Library · Playwright · Home Assistant REST + WebSocket · Capacitor (Fase 5).
Begrundelser: [docs/TECHNICAL_ARCHITECTURE.md §2](docs/TECHNICAL_ARCHITECTURE.md).

## Kom i gang

```bash
pnpm install
pnpm dev
```

Appen starter på <http://localhost:3000> i **demo-tilstand** – der kræves ingen
Home Assistant-forbindelse og ingen `.env`-fil. Vil du ændre konfiguration:
`cp .env.example .env.local` og udfyld (`.env.local` commites ALDRIG).

| Kommando            | Gør                                              |
| ------------------- | ------------------------------------------------ |
| `pnpm dev`          | Udviklingsserver (demo-tilstand som standard)    |
| `pnpm build`        | Produktionsbuild (inkl. service worker)          |
| `pnpm start`        | Kør produktionsbuildet                           |
| `pnpm lint`         | ESLint (inkl. forbud mod løs `process.env`-brug) |
| `pnpm typecheck`    | TypeScript strict                                |
| `pnpm test`         | Vitest (unit + komponent)                        |
| `pnpm test:e2e`     | Playwright (starter selv dev-serveren)           |
| `pnpm format`       | Prettier                                         |
| `pnpm format:check` | Prettier-tjek (CI)                               |

Kvalitetsporte før hver aflevering:
`pnpm lint && pnpm typecheck && pnpm test && pnpm build` (+ `pnpm test:e2e`).

> E2E i containere/CI med præinstalleret Chromium: sæt
> `PLAYWRIGHT_CHROMIUM_PATH=/sti/til/chromium` – så bruger Playwright den
> (med `--no-sandbox`) i stedet for at downloade en browser.

Systemstatus (tilstand, version, prøvenotifikation): `/status` i appen,
maskinlæsbart på `/api/health`.

**Designsystem:** Den interne komponentoversigt på `/design-system` viser alle
UI-komponenter og deres tilstande og er den visuelle reference for al ny UI
(se [docs/DESIGN_PRINCIPLES.md §8](docs/DESIGN_PRINCIPLES.md)).

**Sikkerhed:** Home Assistant-tokens må aldrig ligge i klientkode, `NEXT_PUBLIC_`-
variabler eller commits. Reglerne står i [docs/SECURITY_MODEL.md](docs/SECURITY_MODEL.md).

## Eksisterende app i repoet

`index.html` er en tidligere, selvstændig rutine-app ("Flow"), som fortsat
fungerer uændret (bl.a. via GitHub Pages). Den berøres ikke af Atlas Home-arbejdet;
en evt. flytning/udfasning besluttes særskilt.
