# Beslutningslog – Atlas Home

Indeks over alle arkitekturbeslutninger. De første beslutninger (F0) er logget
i kondenseret form direkte her; fremtidige beslutninger oprettes som fulde ADR'er
i `docs/adr/` efter skabelonen `docs/adr/ADR-TEMPLATE.md` og indekseres nedenfor.

| # | Titel | Status | Dato |
|---|---|---|---|
| 0001 | Next.js App Router som ramme og BFF | Accepteret | 2026-07-20 |
| 0002 | HA-token kun i BFF – klienten taler aldrig direkte med HA (web) | Accepteret | 2026-07-20 |
| 0003 | SSE (ikke WebSocket) mellem klient og BFF | Accepteret | 2026-07-20 |
| 0004 | Appnavnet er udskifteligt via ét brandingmodul | Accepteret | 2026-07-20 |
| 0005 | Serwist til PWA i stedet for next-pwa | Accepteret | 2026-07-20 |
| 0006 | Ingen offline-kommandokø i v1 | Accepteret | 2026-07-20 |
| 0007 | Area-opslag via HA template-API i v1 | Accepteret (genbesøg F3) | 2026-07-20 |
| 0008 | TanStack Query til serverstate, Zustand kun til UI-state | Accepteret | 2026-07-20 |
| 0009 | JSON-fil-persistens i BFF i v1 (ingen database) | Accepteret | 2026-07-20 |

---

## ADR-0001: Next.js App Router som ramme og BFF
**Kontekst:** Behov for webapp + et serverside-sted at gemme HA-token + senere Capacitor.
**Alternativer:** Vite SPA + separat Node-proxy (to deploy-enheder, mere limkode); Remix (mindre økosystem for PWA/shadcn-flowet); ren statisk app med token i klient (afvist af sikkerhed).
**Beslutning:** Next.js med App Router; Route Handlers udgør BFF'en. Én proces at drive lokalt.
**Konsekvens:** Capacitor-fasen kræver adskillelse af app-shell (statisk) og transport – håndteret via `HaClient`-abstraktionen (TECHNICAL_ARCHITECTURE §11). Genbesøges hvis BFF'en vokser til selvstændig service.

## ADR-0002: Token kun i BFF
**Kontekst:** Kerneprincip 6: tokens må aldrig eksponeres i frontend/commits.
**Beslutning:** Klienten kender kun `/api/ha/*`; BFF er eneste token-indehaver. Håndhævet med env-arkitektur, lint-regel og build-scan (SECURITY_MODEL §2–3).
**Konsekvens:** Al HA-trafik har ét kontrolpunkt (whitelist, rate limit, rolle-håndhævelse). I Capacitor-fasen erstattes transporten – reglerne for secure storage overtager dér.

## ADR-0003: SSE mellem klient og BFF
**Kontekst:** Klienten skal have realtidsopdateringer; BFF holder allerede WS mod HA.
**Alternativer:** WS klient↔BFF (mere kode: auth, heartbeats, reconnect i begge ender); polling alene (latenstid, batteri).
**Beslutning:** SSE til server→klient-push (auto-reconnect, HTTP-semantik, cookie-auth gratis); kommandoer som almindelige POSTs. Polling som fallback.
**Konsekvens:** Simplere klient. Genbesøges kun hvis der opstår behov for klient→server-streaming.

## ADR-0004: Udskifteligt appnavn
**Beslutning:** Navn, logo, farve-accent i `src/config/branding.ts` + i18n-nøgler; PWA-manifest genereres herfra. Ingen forekomst af "Atlas Home" andre steder i kode.
**Konsekvens:** Navneskifte er én fil + docs søg/erstat.

## ADR-0005: Serwist frem for next-pwa
**Kontekst:** `next-pwa` er reelt uvedligeholdt og konflikter med nyere Next-versioner.
**Beslutning:** Serwist (vedligeholdt efterfølger, Workbox-baseret, App Router-støtte).
**Konsekvens:** Lidt mere manuel SW-konfiguration; accepteret.

## ADR-0006: Ingen offline-kommandokø i v1
**Kontekst:** Offline kunne kommandoer køes og afspilles ved genforbindelse.
**Beslutning:** Nej. En forsinket "lås op"/"sluk lys"-kommando, der affyres minutter senere, er et sikkerheds- og forvirringsproblem i et hjem. Offline = tydelig læsetilstand; skrivning fejler synligt med det samme.
**Konsekvens:** Enklere og forudsigelig adfærd. Genbesøges kun for idempotente, ufarlige handlinger (fx babyhændelses-registrering, som gerne må køes – afgøres i F2).

## ADR-0007: Area-opslag via template-API i v1
**Kontekst:** HA's REST-API eksponerer ikke area-registret; WS-registry-kommandoer er interne/udokumenterede.
**Beslutning:** Template-API (officielt) til area→entity-mapping ved opstart + manuel genindlæsning; appens curation kan overstyre.
**Konsekvens:** Ingen live-opdatering ved HA-omdøbninger (acceptabelt – sjælden hændelse). Genbesøges i F3 med virkelige data.

## ADR-0008: TanStack Query + Zustand med skarp grænse
**Beslutning:** Al HA-afledt data ejes af TanStack Query (cache, retry, optimistiske opdateringer, persist-til-localStorage for offline-læsning); Zustand kun til ren UI-state. Ingen HA-data i Zustand – nogensinde.
**Konsekvens:** Én kilde til sandhed pr. datatype; SSE-events patcher query-cachen ét sted.

## ADR-0009: JSON-filer i BFF, ingen database i v1
**Kontekst:** Appens egen persistens (curation, scener, roller, babyhændelser) er små datamængder for én husstand.
**Beslutning:** Zod-validerede JSON-filer med `schemaVersion` og atomisk skrivning (DATA_MODEL §8). SQLite udskudt.
**Konsekvens:** Nul drift-kompleksitet; migrering til SQLite er en isoleret BFF-ændring, hvis behovet opstår (trigger: samtidighedsproblemer eller filer > få MB).
