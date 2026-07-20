# Atlas Home

> Projektnavnet er foreløbigt og let at udskifte – se ADR-0004 i
> [docs/DECISIONS.md](docs/DECISIONS.md).

En lokal-først smart home-webapp til hele familien: dansk, enkel (1–2 tryk til
de vigtigste handlinger) og visuelt gennemført – med Home Assistant som usynlig
integrationsmotor. Udvikles først som web/PWA, senere som iOS/Android-app via
Capacitor.

**Status: Fase 0 – fundament.** Dette repo indeholder p.t. arkitektur- og
produktdokumentation samt mappeskelet. Selve appen bygges fra Fase 1
(se [docs/ROADMAP.md](docs/ROADMAP.md)).

## Dokumentation

| Dokument | Indhold |
|---|---|
| [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md) | Vision, målgruppe, kerneprincipper, succeskriterier |
| [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) | Stak, BFF-arkitektur, dataflow, state, fejl-/offlineadfærd, mappestruktur |
| [docs/FEATURE_REQUIREMENTS.md](docs/FEATURE_REQUIREMENTS.md) | Testbare krav pr. modul (inkl. babytilstand) |
| [docs/SECURITY_MODEL.md](docs/SECURITY_MODEL.md) | Trusselsmodel, token-regler, roller, PIN |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Domænemodeller, enhedstyper, kommandoer, persistens |
| [docs/HOME_ASSISTANT_INTEGRATION.md](docs/HOME_ASSISTANT_INTEGRATION.md) | REST/WS-brug, entity-mapping, fejlkoder |
| [docs/DESIGN_PRINCIPLES.md](docs/DESIGN_PRINCIPLES.md) | UI-regler, responsivitet, a11y, vægpanel |
| [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md) | Testpyramide, mock-strategi, e2e-flows, kvalitetsporte |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Faser F0–F5, milepæle, Definition of Done for v1 |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Beslutningslog + ADR-indeks ([skabelon](docs/adr/ADR-TEMPLATE.md)) |

## Teknologistak (besluttet)

Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS · shadcn/ui ·
TanStack Query · Zustand · Zod · next-intl · Serwist (PWA) · Vitest + React
Testing Library · Playwright · Home Assistant REST + WebSocket · Capacitor (Fase 5).
Begrundelser: [docs/TECHNICAL_ARCHITECTURE.md §2](docs/TECHNICAL_ARCHITECTURE.md).

## Kom i gang (fra Fase 1)

```bash
cp .env.example .env.local   # udfyld værdier – .env.local commites ALDRIG
pnpm install
pnpm dev                     # kører i demo-tilstand (APP_MODE=demo) uden HA-anlæg
```

Kvalitetsporte: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
(+ `pnpm test:e2e` for Playwright).

**Sikkerhed:** Home Assistant-tokens må aldrig ligge i klientkode, `NEXT_PUBLIC_`-
variabler eller commits. Reglerne står i [docs/SECURITY_MODEL.md](docs/SECURITY_MODEL.md).

## Eksisterende app i repoet

`index.html` er en tidligere, selvstændig rutine-app ("Flow"), som fortsat
fungerer uændret (bl.a. via GitHub Pages). Den berøres ikke af Atlas Home-arbejdet;
en evt. flytning/udfasning besluttes særskilt.
