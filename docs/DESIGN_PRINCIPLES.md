# Designprincipper – Atlas Home

Bindende for al UI. Håndhæves i code review og – hvor muligt – i lint/tests.

## 1. Grundregler

1. **1–2 tryk:** Kernehandlinger (scener, lys til/fra, baby-hændelser) maks. 2 tryk
   fra dashboard. Alt der kræver 3+ tryk skal begrundes i PR-beskrivelsen.
2. **Vis tilstand, ikke kontroller:** Standardvisning er status ("21,5° · Låst ·
   Alt lukket"); kontroller foldes ud ved tryk.
3. **Aldrig kun farve:** Al status formidles med farve **og** ikon **og** tekst
   (farveblindhed + nattetema).
4. **Dansk hverdagssprog:** "Låst op", ikke "Unlocked". Ingen HA-jargon
   (entity, service, domain) i UI. Tone: rolig, konkret, uden udråbstegn.
5. **Intet destruktivt uden bekræftelse:** Oplåsning, ferietilstand fra, sletning →
   bekræftelsesdialog med konsekvensbeskrivelse.
6. **Alle sider har loading (skeleton), empty (med vejledning + handling) og
   error (forklaring + "Prøv igen").** Genbrug `src/components/states/`.

## 2. Responsivitet og enhedsklasser

| Breakpoint  | Enhed                     | Layout                                                                                           |
| ----------- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| < 640 px    | Telefon                   | Én kolonne, bundnavigation (5 punkter: Hjem, Rum, Scener, Baby, Mere), tommelfinger-zone nederst |
| 640–1024 px | Tablet/iPad               | 2-kolonne grid, sidenavigation venstre                                                           |
| ≥ 1024 px   | Desktop/vægpanel liggende | 3–4-kolonne grid, sidenavigation                                                                 |

- Touch-mål min. 44×44 px (Apple HIG). Ingen hover-afhængig funktionalitet.
- Safe-area-insets (notch/home-indicator) respekteres fra dag ét (PWA + Capacitor).

## 3. Vægpanel-tilstand

- Aktiveres i Indstillinger pr. enhed: større typografi (+25 %), permanent
  dashboard, ingen bundnavigation (kun scener + rum), automatisk retur til
  dashboard efter 60 s inaktivitet, dæmpet nattetema efter kl. 21.

## 4. Tema og tokens

- Design-tokens i Tailwind-config (`--color-*`, spacing, radius) – ingen rå
  hex-værdier i komponenter.
- Lyst og mørkt tema fra dag ét; **nattetema** (ekstra dæmpet, varm farvetone,
  ingen store hvide flader) aktiveres automatisk af Babytilstand og efter
  konfigurerbart klokkeslæt. Maks. luminans i nattetema er en token, ikke pr.-komponent-valg.
- Appnavn og logo kommer altid fra `src/config/branding.ts` (navneskifte = én fil).

## 5. Tilgængelighed (a11y)

- WCAG 2.1 AA-kontrast i alle temaer (verificeres med automatiseret aksecheck i CI).
- Al interaktion mulig med tastatur; synligt fokus-ring-design.
- shadcn/ui/Radix-primitives bruges for korrekt ARIA i dialoger, sliders, switches.
- `prefers-reduced-motion` respekteres; animationer er additive, aldrig bærende.
- Dynamisk tekstskalering: layoutet må ikke knække ved 130 % tekststørrelse.

## 6. Ikonografi og illustrationer

- Ét ikonbibliotek: Lucide (følger med shadcn/ui). Ingen emoji som UI-ikoner.
- Rum og scener har valgbare ikoner fra et kurateret sæt (`src/config/icons.ts`).

## 7. Feedback-mønstre

- Optimistisk UI med diskret spinner på det berørte kort; rollback + toast ved fejl.
- Sceneaktivering: fuldskærms-let overlay med trinvis ✓-liste (maks. 3 s, kan afvises).
- Toasts: maks. én ad gangen, 4 s, aldrig til succes af trivielle handlinger
  (lys tændt = lyset ser tændt ud – ingen toast).
- Inline-bekræftelse (`ConfirmationFeedback`) bruges efter handlinger uden
  synligt resultat; annonceres via `aria-live="polite"`.

## 8. Komponentbiblioteket (implementeret)

Al UI bygges med komponenterne i `src/components/` – aldrig ad hoc-markup for
mønstre, der allerede findes. Den levende reference er den interne side
**`/design-system`** (link under "Mere"), som viser alle komponenter og deres
tilstande i både lyst og mørkt tema.

| Kategori               | Komponenter                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitiver (`ui/`)     | Button, Card, Badge, StatusBadge, Switch, Slider, SegmentedControl, Tabs, Dialog, BottomSheet, ConfirmDialog, DropdownMenu, Tooltip, ColorPicker, ColorTemperaturePicker, Skeleton, Toaster |
| Enheder (`devices/`)   | DeviceCard, SensorValue, TemperatureDisplay, HumidityDisplay, BatteryStatus, QuickActionButton                                                                                              |
| Rum/scener             | RoomCard, SceneCard                                                                                                                                                                         |
| Feedback (`feedback/`) | ConnectionStatus, OfflineBanner, AlertCard, ConfirmationFeedback                                                                                                                            |
| Tilstande (`states/`)  | EmptyState, ErrorState, PageSkeleton                                                                                                                                                        |

Bindende regler for komponenterne:

1. Enhedstilstande (`on`/`off`/`busy`/`unavailable`/`error`) vises altid med
   ikon OG tekst via `StatusBadge` – utilgængelige enheder nedtones, skjules aldrig.
2. Interaktive elementer har ≥ 44 px trykflade (Switch/Slider har usynligt
   udvidet hit-område); QuickActionButton er ≥ 80 px til vægpanel/natbrug.
3. Alle overlays (dialog, bottom sheet, bekræftelse, dropdown) bygger på
   Radix-primitiver: fokusfælde, Escape-luk og korrekte ARIA-roller følger med.
4. Destruktive/konsekvensfyldte handlinger går altid gennem `ConfirmDialog`.
5. Farvevalg til lys sker via den kuraterede palette i
   `src/config/light-colors.ts` – aldrig frie farvehjul.
