# Home Assistant-integration – Atlas Home

Beskriver præcis hvordan BFF'en taler med Home Assistant (HA). Alt her lever i
`src/lib/ha/` og er skjult bag `HaClient`-interfacet (TECHNICAL_ARCHITECTURE §5).

## 1. Forbindelser og autentificering

| Kanal | Endpoint | Bruges til |
|---|---|---|
| REST | `GET {HA_URL}/api/config` | Health/versionstjek ved opstart |
| REST | `GET {HA_URL}/api/states` | Initialt snapshot |
| REST | `POST {HA_URL}/api/services/{domain}/{service}` | Kommandoer |
| REST | `GET {HA_URL}/api/history/period/...` | Energi-/klimahistorik |
| REST | `GET {HA_URL}/api/template` (POST) | Area-/device-registry-opslag i v1, se §5 |
| WebSocket | `{HA_WS_URL}/api/websocket` | `state_changed`-events (subscribe_events) |

- Auth: long-lived access token (oprettes i HA-brugerprofilen) som
  `Authorization: Bearer {HA_TOKEN}` (REST) og `auth`-besked (WS).
- Kun BFF'en forbinder til HA. `HA_URL` er typisk `http://homeassistant.local:8123`
  eller fast LAN-IP. HTTPS anbefales i opsætningsguiden.

## 2. WebSocket-livscyklus (BFF)

1. Connect → modtag `auth_required` → send `auth` med token → forvent `auth_ok`
   (ved `auth_invalid`: sæt ConnectionState `AUTH_FAILED`, ingen retry-storm – retry hvert 60 s).
2. `subscribe_events` (event_type: `state_changed`).
3. Heartbeat: `ping` hvert 20 s; intet `pong` inden 10 s → luk og genforbind.
4. Genforbindelse: eksponentiel backoff 1→2→4→…→30 s (+ jitter). Efter genforbindelse
   hentes fuldt REST-snapshot (events kan være mistet) og klienter får `resync`-event.
5. Én WS-forbindelse uanset antal klienter; BFF'en multiplexer via SSE.

## 3. Kommandomapping (whitelist)

Kun disse oversættelser findes; alt andet afvises af BFF'en (SECURITY_MODEL §4):

| DeviceCommand | HA service call |
|---|---|
| `light.set {on:true, brightness, colorTempK, rgb}` | `light.turn_on {entity_id, brightness_pct, color_temp_kelvin, rgb_color}` |
| `light.set {on:false}` | `light.turn_off` |
| `lock.set {action:"lock"}` | `lock.lock` |
| `lock.set {action:"unlock"}` (PIN verificeret i BFF først) | `lock.unlock` |
| `climate.setTarget` | `climate.set_temperature {temperature}` |
| `vacuum.run {start/pause/dock}` | `vacuum.start` / `vacuum.pause` / `vacuum.return_to_base` |
| `media.set` | `media_player.play_media` / `media_player.media_stop` / `volume_set` |
| `scene.activate` | Sekvens af ovenstående (appens egne scener) + evt. `scene.turn_on` for HA-scener |

Timeout pr. service call: 5 s. Scener kører handlinger parallelt med samlet
resultat pr. trin (`CommandResult.steps`).

## 4. Entity-mapping HA-domæne → DeviceKind

| HA-domæne | Betingelse | DeviceKind |
|---|---|---|
| `light` | – | `light` (capabilities fra `supported_color_modes`) |
| `lock` | – | `lock` |
| `binary_sensor` | `device_class: door\|window\|garage_door` | `opening` |
| `binary_sensor` | `device_class: motion\|occupancy` | `motion` |
| `climate` | – | `climate` |
| `sensor` | `device_class: temperature\|humidity` | `env` (temp+fugt fra samme fysiske enhed grupperes via device-registry) |
| `sensor` | `device_class: carbon_dioxide\|pm25` | `airQuality` |
| `sensor` | `device_class: power\|energy` | `energy` |
| `vacuum` | – | `vacuum` |
| `media_player` | – | `media` |
| Øvrige | – | `unsupported` (logges, vises kun i enhedsadministration) |

Mappingen implementeres som rene funktioner med Zod-parse af attributter og
testes mod optagne fixtures (`src/lib/ha/__fixtures__/`). Ved parse-fejl:
`availability: "unsupported"` – aldrig crash.

## 5. Rum (Areas)

HA's REST-API eksponerer ikke area-registret direkte. Valg for v1 (ADR-0007):
BFF henter area→entity-mapping via HA's template-API
(`{{ states | ... area_id/area_name ... }}`) ved opstart og cacher den; opdateres
ved manuel "Genindlæs enheder" i enhedsadministrationen. Alternativet
(WS-kommandoerne `config/area_registry/list` + `config/entity_registry/list`)
er ikke-dokumenteret API, men mere robust – beslutningen genbesøges i Fase 3,
når integrationen bygges. Appens curation kan altid overstyre rumtildeling.

## 6. Fejlkoder fra HA → AppErrorCode

| HA-svar | AppErrorCode | UI-tekst (da) |
|---|---|---|
| ECONNREFUSED/timeout mod HA | `HA_UNREACHABLE` | "Ingen forbindelse til hjemmet" |
| 401 | `AUTH_FAILED` | "Adgang afvist – tjek opsætning" (kun Voksen ser detaljer) |
| 404 på entity / state `unavailable` | `DEVICE_UNAVAILABLE` | "{navn} er ikke tilgængelig" |
| Service call 200 men ingen state-ændring < 5 s | `TIMEOUT` | "{navn} svarede ikke – prøv igen" |
| WS lukket | håndteres af ConnectionState | Banner, jf. TECHNICAL_ARCHITECTURE §8 |

## 7. Versionspolitik

- Testes mod nyeste HA-stable ved integrationsstart (Fase 3); minimumsversion
  fastlåses dér og dokumenteres i README.
- Kun officielle/stabile API'er (REST + WebSocket). Ingen afhængighed af
  HA-frontendens interne endpoints (undtagelsen i §5 er markeret som genbesøg).

## 8. Udviklingsopsætning uden fysisk hardware

- Primært: mocktilstand (`APP_MODE=demo`).
- Sekundært (Fase 3): HA kørende i Docker-container med demo-integrationen
  (`demo:`-platformen) som realistisk integrationstestmiljø – bruges i CI til
  kontrakttest af `RealHaClient` (TEST_STRATEGY §5).
