# Featurekrav – Atlas Home

Krav skrives som testbare udsagn. "Skal" = krav til v1-web. "Senere" = planlagt,
se ROADMAP.md for fase. Hvert modul angiver sine tre standardtilstande
(loading/empty/error) kun hvor de afviger fra standarden i TECHNICAL_ARCHITECTURE §8.

Roller: **Voksen** (fuld adgang), **Barn** (begrænset), **Gæst** (minimal),
**Vægpanel** (delt enhed, som Barn + scener). Se SECURITY_MODEL §6.

## 1. Dashboard

- Skal vise: klokkeslæt/dato, aktiv scene, forbindelses-/demostatus, kuraterede
  kort (favoritter), indeklima-resumé og sikkerhedsresumé (lås + åbne vinduer/døre).
- Skal kunne aktivere alle 10 hverdagsscener med maks. 2 tryk (1 tryk for de 4 fastgjorte).
- Skal tilpasse indhold efter tid på døgnet: efter kl. 21 fremhæves Godnat/Babytilstand.
- Kortrækkefølge konfigurerbar pr. enhed (vægpanel ≠ telefon) – gemmes lokalt.
- Empty: før opsætning vises onboarding-kort ("Vælg dine favoritter").

## 2. Rum

- Skal vise rumliste med pr. rum: navn, ikon, temperatur, antal tændte lys, aktive enheder.
- Rumdetalje: alle enheder i rummet grupperet efter type; lys øverst.
- Rum kommer fra HA Areas (HOME_ASSISTANT_INTEGRATION §5); navne kan overstyres i appen.
- Enheder uden rum samles i "Øvrige" (skal aldrig forsvinde).

## 3. Lys

- Skal: tænd/sluk pr. lampe og pr. rum (ét tryk), lysstyrke (slider), farvetemperatur
  hvis lampen understøtter det (capability-styret, se DATA_MODEL §3).
- Farvevalg (RGB): kun for lamper med capability `color`; enkel presets-palette, ikke farvehjul, i v1.
- Optimistisk UI med rollback (TECHNICAL_ARCHITECTURE §8).
- Barn-rolle: kun lys i egne tildelte rum.

## 4. Scener

- De 10 hverdagsscener (Godmorgen, Vi går hjemmefra, Vi er hjemme, Aften, Filmaften,
  Godnat, Babytilstand, Natlys, Rengøring, Ferietilstand) er **appens egne**
  domænescener: en navngiven liste af typede kommandoer + evt. HA-scene-reference.
- Skal: aktivering med resultatvisning pr. handling (✓/✗ + retry på fejlede).
- Skal: redigering (Voksen): tilføj/fjern handlinger fra kuraterede enheder.
- Ferietilstand og Babytilstand er *tilstande* (vedvarende, med badge i UI), de
  øvrige er *engangs-scener*. Tilstande kan deaktiveres eksplicit.
- Senere: tidsstyret automatisk aktivering (via automatiseringsmodulet).

## 5. Sensorer (fælles)

- Temperatur, luftfugtighed, bevægelse, lysniveau vises altid med enhed, rum og
  "sidst opdateret". Værdier > 15 min gamle markeres som muligvis forældede.

## 6. Dørlås

- Skal: vise låst/ulåst med utvetydig farve+ikon+tekst (aldrig kun farve).
- Lås/oplås kræver Voksen-rolle **og** bekræftelsesdialog; oplås kræver desuden PIN
  (SECURITY_MODEL §7). Vægpanel kan aldrig oplåse.
- Fejlscenarie `lock-jammed` skal vises eksplicit: "Låsen svarer ikke – tjek døren".

## 7. Dør- og vinduessensorer

- Skal: samlet status "Alt lukket" / "3 åbne" på dashboard; liste med rum og varighed
  ("Køkkenvindue – åbent i 2 t").
- Skal indgå i "Vi går hjemmefra"-tjeklisten og Godnat-resumé.

## 8. Varme

- Skal: vise mål- og faktisk temperatur pr. rum; justering i 0,5°-trin med
  store +/‑-knapper; forudindstillinger (Hjemme 21°, Nat 18°, Væk 16°).
- Skal: koble til scener (Godnat sænker, Godmorgen hæver).
- Senere: ugeplan.

## 9. Luftkvalitet

- Skal: CO₂, PM2.5 og luftfugtighed pr. rum med trafiklys-fortolkning på dansk
  ("God", "Luft ud snart", "Luft ud nu") frem for rå tal som primærvisning.
- Grænseværdier i `src/config/air-quality.ts` (dokumenteret kilde, ikke hardcodet i UI).

## 10. Robotstøvsuger

- Skal: status (dokker, støvsuger, fast/fejl), start/pause/send hjem, batteri.
- Skal: indgå i Rengørings- og Vi går hjemmefra-scenen.
- Senere: rum-specifik rengøring (kræver kort-support pr. producent).

## 11. Energiforbrug

- Skal: aktuelt forbrug (W) og dagens forbrug (kWh) + simpel 24t/7d-graf
  (via HistoryQuery, DATA_MODEL §5).
- Skal: fremhæve de 3 største kuraterede forbrugere.
- Senere: priser/omkostninger (kræver elprisintegration).

## 12. Notifikationer

- v1: **in-app** notifikationscenter: hændelsesliste (dør åbnet under Ferietilstand,
  lås fejlede, CO₂ høj, støvsuger sidder fast, vaskemaskine færdig ved energifald).
- Regler defineres i appen som typede hændelsesregler (DATA_MODEL §7); evalueres i BFF.
- Senere (Fase 4): Web Push; (Fase 5) native push via Capacitor.

## 13. Automatiseringer

- v1: **læsevisning** af appens egne regler + mulighed for at slå til/fra.
  Ingen generel regel-editor i v1 (kompleksitetsfælde).
- Skabelonbaserede automatiseringer (Fase 3): "Tænd natlys ved bevægelse om natten",
  "Sluk alt lys når sidste person går" – udfyld parametre, ikke fri logik.
- HA-automatiseringer vises ikke rå; appen rører dem ikke.

## 14. Babytilstand (både scene/tilstand og egen side)

Egen side (`/baby`) – skal i v1:
- Aktivér/deaktivér Babytilstand (tilstand med badge): dæmper lys til varm hvid
  lav styrke i valgte rum, deaktiverer appens egne kraftige lysautomatiseringer
  og lyde, aktiverer dæmpet mørkt UI-tema.
- Vise babyværelsets temperatur og luftfugtighed med anbefalet interval (18–21°).
- Registrere hændelser med ét tryk: "Måltid nu", "Bleskift nu" (+ mulighed for at
  angive tidspunkt bagud). Vise "seneste måltid/bleskift for X siden".
- Bleskiftstimer: valgfri påmindelse efter konfigurerbart interval (in-app i v1).
- White noise-genvej: tænd/sluk forudvalgt medieafspiller/afspilning.
- Nattehandlings-række: Natlys, White noise, Dæmp alt, Måltid, Bleskift – store
  trykflader, brugbare med én hånd i mørke.
- Empty: før opsætning guides til at vælge babyværelse og enheder.
- Data: hændelser gemmes via BFF (DATA_MODEL §6), synligt på tværs af familiens enheder.

## 15. Familie og brugerroller

- v1: rolleprofiler uden password (vælges pr. enhed): Voksen, Barn, Gæst, Vægpanel.
  Voksen-skift + beskyttede handlinger kræver PIN. Se SECURITY_MODEL §6–7.
- Skal: pr. rolle konfigurerbare tilladte rum og moduler (Voksen konfigurerer).

## 16. Indstillinger

- Skal: appnavn/tema, rolle for denne enhed, favoritter, babytilstands-opsætning,
  sprog (kun dansk valgbart i v1), demo-tilstand til/fra (kun Voksen), PIN-ændring.

## 17. Enhedsadministration

- Skal (Voksen): liste over alle opdagede HA-entiteter → kuratér: medtag/skjul,
  omdøb til dansk, tildel rum og type-overstyring. Kurateringen er appens
  "adressebog" (DATA_MODEL §2) og gemmes via BFF.
- Skal: vise `unavailable`/`unsupported` enheder med forklaring.

## 18. Forbindelsesstatus

- Skal: global statusindikator (grøn/gul/rød/demo) i skallen; detaljeside med
  HA-version, latenstid, sidste event, genforbind-knap og fejlhistorik.
- Al adfærd følger TECHNICAL_ARCHITECTURE §8.

## 19. Demo-/mocktilstand

- Skal: aktiverbar uden HA-anlæg (`APP_MODE=demo` eller toggle i Indstillinger).
- Skal: tydeligt "Demo"-badge; realistiske data (TECHNICAL_ARCHITECTURE §10);
  fejlscenarier via `?mockScenario=`.
- Demo-data må aldrig blandes med rigtige data (separat storage-namespace).
