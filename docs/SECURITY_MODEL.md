# Sikkerhedsmodel – Atlas Home

## 1. Trusselsmodel (afgrænset og realistisk)

Appen kører lokal-først på et privat hjemmenetværk. Vi beskytter mod:

| Trussel | Relevans | Modforanstaltning |
|---|---|---|
| HA-token lækket via frontend-bundle, git eller browserdevtools | **Høj** (mest sandsynlige reelle fejl) | Token findes kun i BFF-processens env (§2); automatiseret leak-test (§3) |
| Børn/gæster udfører farlige handlinger (oplåsning, ferietilstand fra) | Høj | Rollemodel + PIN (§6–7) |
| Andre enheder på LAN kalder BFF'ens API | Mellem | BFF kræver session-cookie udstedt ved enhedsopsætning (§5) |
| Eksponering mod internettet (bruger port-forwarder selv) | Mellem | Dokumenteret anbefaling: kun adgang via VPN/Tailscale; appen antager ikke selv HTTPS-terminering men kræver `secure`-cookies når den serveres over HTTPS |
| XSS → kommandoudførelse | Mellem | Ingen `dangerouslySetInnerHTML`, CSP-headers (§4), al eksterntekst (HA friendly names) renderes som tekst |
| Aflytning af LAN-trafik | Lav (privat net) | Anbefaling om HTTPS til HA og til appen dokumenteres i README-opsætning |
| Cloud-læk | Ikke relevant | Ingen cloud i v1; ingen telemetri |

Uden for scope i v1: beskyttelse mod en angriber med fysisk adgang til serveren,
og mod kompromitteret Home Assistant selv.

## 2. Token-håndtering (ufravigelige regler)

1. HA long-lived access token ligger **kun** i `HA_TOKEN` (server-env). Ingen
   `NEXT_PUBLIC_`-variabel må nogensinde indeholde hemmeligheder.
2. `.env.local` er git-ignoreret; `.env.example` indeholder kun pladsholdere.
3. Tokenet sendes udelukkende fra BFF til HA som `Authorization: Bearer`-header.
   Det logges aldrig, indgår aldrig i fejlbeskeder, URL'er eller klient-svar.
4. Env læses ét sted: `src/config/env.ts` med Zod-validering ved opstart –
   serverskema (med `HA_TOKEN`) og klientskema er adskilte typer, så et
   serverfelt ikke kan importeres i klientkode uden typefejl.
5. Capacitor-fasen: token i iOS Keychain / Android Keystore via Secure Storage-
   plugin; aldrig i `Preferences`/localStorage. (TECHNICAL_ARCHITECTURE §11.)

## 3. Automatiserede værn (indføres i Fase 1-CI)

- **Leak-test:** build-scriptet fejler, hvis strengen fra `HA_TOKEN`-mønstre
  (`eyJ`-prefiks/JWT-mønster) eller ordet `HA_TOKEN` optræder i `.next/static/**`.
- **Secret-scanning:** gitleaks i CI + `.gitignore` dækker `.env*` (undtagen `.env.example`).
- **Lint-regel:** forbud mod `process.env` uden for `src/config/env.ts`.

## 4. BFF-API-sikkerhed

- Alle `/api/ha/*`-endpoints validerer input med Zod; ukendte kommandotyper afvises.
- Kommando-whitelist: BFF kan kun kalde de HA-services, som device-registret
  eksplicit mapper (HOME_ASSISTANT_INTEGRATION §6). Vilkårlige service calls fra
  klienten er umulige.
- Svar indeholder domænemodeller – aldrig rå HA-payloads (mindsker utilsigtet dataeksponering).
- CSP: `default-src 'self'`; ingen tredjeparts-scripts. Ingen eksterne fonts/CDN'er.
- Rate limit på kommando-endpointet (fx 30/min pr. session) som værn mod løbske klienter.

## 5. Enhedsopsætning og sessioner

- Første gang en enhed åbner appen, parres den med en opsætningskode (vises af
  Voksen i Indstillinger). BFF udsteder en langlivet, httpOnly session-cookie
  bundet til enheden og dens rolle.
- Uparrede requests får kun adgang til parringssiden – ikke til data eller kommandoer.
- Voksen kan se og tilbagekalde parrede enheder i Indstillinger.

## 6. Roller og rettigheder

| Handling | Voksen | Barn | Gæst | Vægpanel |
|---|---|---|---|---|
| Se dashboard/sensorer | ✓ | ✓ (tildelte rum) | ✓ (begrænset) | ✓ |
| Styre lys | ✓ | ✓ (tildelte rum) | ✓ (fællesrum) | ✓ |
| Aktivere scener | ✓ | Natlys/Godnat | ✗ | ✓ (undtagen Ferietilstand) |
| Låse dør | ✓ | ✗ | ✗ | ✓ |
| **Oplåse dør** | ✓ + PIN | ✗ | ✗ | ✗ |
| Varme, ferietilstand, automatiseringer | ✓ | ✗ | ✗ | ✗ |
| Indstillinger/enhedsadministration/demo-toggle | ✓ + PIN | ✗ | ✗ | ✗ |
| Babytilstand + hændelsesregistrering | ✓ | ✗ | ✗ | ✓ |

Håndhævelse sker i **BFF'en** (rollen ligger i session-cookien) – UI-skjulning
er kun en høflighed, aldrig sikkerhedsgrænsen.

## 7. PIN-beskyttede handlinger

- 4–6-cifret PIN, sat ved onboarding; hash (argon2id) gemmes i BFF'ens config-fil.
- Kræves til: oplåsning, indstillinger, rolleskift til Voksen, demo-toggle,
  deaktivering af Ferietilstand.
- 5 fejlforsøg → 5 min. lockout (pr. enhed) + notifikation i hændelsesloggen.

## 8. Privatliv

- Ingen telemetri, ingen eksterne kald fra klienten, ingen konti hos tredjepart.
- Babydata (måltider/bleskift) er persondata om et barn: forbliver lokalt,
  eksport/sletning tilbydes i Indstillinger.
- Logs i BFF roteres og indeholder aldrig tokens, PIN eller babydata-indhold.
