# Produktvision – Atlas Home

> Projektnavnet "Atlas Home" er foreløbigt. Navnet må kun optræde ét sted i koden
> (`src/config/branding.ts`) og i dokumentation, så det let kan udskiftes. Se ADR-0004.

## 1. Én sætning

Atlas Home samler familiens smarte hjem i én enkel, dansk, visuelt gennemført
grænseflade, hvor de vigtigste handlinger kan udføres med ét eller to tryk –
drevet af Home Assistant som usynlig integrationsmotor.

## 2. Problem

Home Assistants egen brugerflade er bygget til teknikere: hundredvis af entiteter,
teknisk sprog, engelsk terminologi og mange klik for simple handlinger. En familie
med børn har brug for det modsatte: få, relevante valg, store trykflader, dansk
sprog og tryghed for at "det bare virker".

## 3. Målgruppe og primære personaer

| Persona | Enhed | Behov |
|---|---|---|
| Forælder (primær administrator) | iPhone | Hurtige scener ("Godnat"), status ved udgang (lås/vinduer), babytilstand om natten |
| Partner (dagligbruger) | iPhone/iPad | Lys og varme uden opsætning, notifikationer der giver mening |
| Barn (begrænset bruger) | iPad/vægtablet | Få, sikre handlinger: eget lys, natlys – ingen adgang til lås og indstillinger |
| Vægtablet (fælles kontrolpanel) | iPad/Android-tablet monteret på væg | Altid tændt dashboard, store trykflader, ingen login-friktion, kiosk-agtig |
| Gæst/bedsteforælder | Egen telefon | Midlertidig, stærkt begrænset adgang |

## 4. Hvad appen ER og IKKE er

**ER:**
- Familiens daglige betjeningsflade: scener, lys, varme, lås, støvsuger, baby.
- Lokal-først: fungerer på hjemmenetværket uden cloud-afhængighed.
- Et kurateret lag oven på Home Assistant.

**IKKE:**
- En erstatning for Home Assistants konfigurationsflade. Opsætning af integrationer,
  Zigbee-parring, YAML m.m. sker fortsat i Home Assistant.
- En generisk "vis alle entiteter"-app. Kun kuraterede, navngivne enheder vises.
- En cloud-tjeneste. Ingen data forlader hjemmet i v1.

## 5. Kerneprincipper (bindende for alle features)

1. **1–2 tryk-reglen:** De 10 hverdagsscener og tænd/sluk af lys skal kunne udføres
   med maksimalt to tryk fra dashboardet.
2. **Relevans frem for kontrol:** Dashboardet viser kontekstuel information
   (tid på døgnet, aktiv scene, åbne vinduer) – ikke en entitetsliste.
3. **Dansk overalt:** Al UI-tekst er dansk. Tekster ligger i beskedfiler, så
   internationalisering er teknisk forberedt (se TECHNICAL_ARCHITECTURE §9).
4. **Sikker som standard:** Home Assistant-tokens findes aldrig i browserkode,
   bundles eller commits (se SECURITY_MODEL).
5. **Udvidbar:** Nye enhedstyper tilføjes via registret i `src/features/devices`
   uden at røre eksisterende moduler (se TECHNICAL_ARCHITECTURE §6).
6. **Demo-først:** Alt kan udvikles, demonstreres og testes i mocktilstand uden
   et fysisk anlæg.

## 6. Nordstjerne-scenarier (skal føles magiske)

1. **Godnat med ét tryk:** Fra dashboard: tryk "Godnat" → alt lys slukker, døren
   låser, varmen sænkes, natlys tændes på børneværelset. Bekræftelse på skærmen
   viser præcis hvad der skete – og hvad der fejlede.
2. **Babynat:** Kl. 03 åbner forælderen appen: den er allerede i dæmpet nattetema,
   viser babyværelsets temperatur/luftfugtighed, "seneste måltid for 2t 40m siden",
   og har store knapper til white noise og bleskiftstimer.
3. **Vi går hjemmefra:** Ét tryk viser tjekliste (vinduer lukket? lås aktiveret?
   komfur-stik slukket?), aktiverer scenen og bekræfter.
4. **Vægtablettet:** Familien går forbi og ser med ét blik: klokken, aktiv scene,
   indeklima, om døren er låst – og kan skifte scene med ét tryk.

## 7. Succeskriterier for v1 (web)

- En ikke-teknisk voksen kan uden instruktion: aktivere en scene, tænde/slukke
  lys i et rum, aflæse temperatur og se om døren er låst.
- Alle kerneflows fungerer i mocktilstand og består Playwright-e2e.
- Tid fra app-åbning til dashboard er interaktivt: < 2 s på mellemklasse-tablet.
- Ingen HA-token i klient-bundle (verificeret af automatiseret test, se TEST_STRATEGY §7).
- Fungerer på 375 px (iPhone SE), 768–1024 px (iPad) og desktop.

## 8. Bevidste fravalg i v1

| Fravalg | Begrundelse | Genbesøges |
|---|---|---|
| Kamerastreams | Kompleksitet (WebRTC/HLS), ikke kritisk for daglig brug | Fase 4+ |
| Talestyring | Dækkes af HomeKit/Assist udenom appen | Senere |
| Historik-grafer ud over energi/klima | Kuratering frem for data-dump | Fase 3 |
| Multi-hjem | Én familie, ét hjem er kernen | Ved behov |
| Brugeroprettelse med individuelle logins pr. familiemedlem | v1 bruger rolleprofiler uden adgangskode på lokalnettet, PIN til beskyttede handlinger | Fase 4 (se SECURITY_MODEL §6) |
