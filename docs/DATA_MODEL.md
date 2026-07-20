# Datamodel – Atlas Home

Domænemodellen er appens sandhed. HA-entiteter mappes ind i den ved
integrationsgrænsen (BFF) og forlader den aldrig rå. Typerne her implementeres
i `src/types/` med tilhørende Zod-skemaer i `src/lib/ha/schemas/`.

## 1. Kernehierarki

```
Home
 ├── Area[]        (rum)
 ├── Device[]      (kuraterede enheder, diskrimineret union på `kind`)
 ├── SceneDef[]    (appens scener/tilstande)
 ├── Rule[]        (notifikations-/automatiseringsregler)
 └── Person[]      (rolleprofiler)
```

## 2. Enheds-grundtype og kuratering

```ts
type DeviceId = string & { readonly __brand: "DeviceId" }; // stabilt app-id (uafhængigt af HA)

interface DeviceBase {
  id: DeviceId;
  source: { haEntityId: string } | { mock: true };
  name: string; // dansk visningsnavn (kurateret, overstyrer HA)
  areaId: AreaId | null; // null → "Øvrige"
  kind: DeviceKind; // se §3
  availability: "available" | "unavailable" | "unsupported";
  lastUpdated: string; // ISO 8601
  hidden: boolean; // kurateret fravalg – data hentes stadig
}
```

**CurationEntry** (enhedsadministration, gemmes i BFF-config):
`{ haEntityId, name?, areaId?, kindOverride?, hidden }`. Nye HA-entiteter uden
curation-entry er som udgangspunkt `hidden: true` (opt-in-kuratering).

## 3. Enhedstyper (`DeviceKind` – diskrimineret union)

Capabilities styrer UI'et: en komponent viser kun kontroller, som enheden erklærer.

```ts
type Device =
  | LightDevice
  | LockDevice
  | OpeningSensor
  | ClimateDevice
  | EnvSensor
  | AirQualityDevice
  | VacuumDevice
  | EnergyMeter
  | MediaPlayerDevice
  | MotionSensor;

interface LightDevice extends DeviceBase {
  kind: "light";
  state: {
    on: boolean;
    brightness?: number /*0–100*/;
    colorTempK?: number;
    rgb?: [number, number, number];
  };
  capabilities: { dim: boolean; colorTemp: boolean; color: boolean };
}

interface LockDevice extends DeviceBase {
  kind: "lock";
  state: { status: "locked" | "unlocked" | "locking" | "unlocking" | "jammed" };
}

interface OpeningSensor extends DeviceBase {
  // dør/vindue
  kind: "opening";
  state: { open: boolean; openSince?: string };
  meta: { openingType: "door" | "window" };
}

interface ClimateDevice extends DeviceBase {
  // termostat/varme
  kind: "climate";
  state: { currentC: number; targetC: number; heating: boolean };
  capabilities: { minC: number; maxC: number; stepC: 0.5 };
}

interface EnvSensor extends DeviceBase {
  // temp/fugt uden styring
  kind: "env";
  state: { temperatureC?: number; humidityPct?: number };
}

interface AirQualityDevice extends DeviceBase {
  kind: "airQuality";
  state: { co2Ppm?: number; pm25?: number; humidityPct?: number };
}

interface VacuumDevice extends DeviceBase {
  kind: "vacuum";
  state: {
    activity:
      "docked" | "cleaning" | "returning" | "paused" | "stuck" | "error";
    batteryPct: number;
  };
}

interface EnergyMeter extends DeviceBase {
  kind: "energy";
  state: { powerW?: number; todayKwh?: number };
  meta: { scope: "home" | "device" };
}

interface MediaPlayerDevice extends DeviceBase {
  // bl.a. white noise
  kind: "media";
  state: { playing: boolean; volumePct?: number; nowPlaying?: string };
}

interface MotionSensor extends DeviceBase {
  kind: "motion";
  state: { motion: boolean; lastMotion?: string; luxLevel?: number };
}
```

Nye typer tilføjes via device-registret (TECHNICAL_ARCHITECTURE §6) + en ny
union-gren her – aldrig via `any` eller generiske attribut-poser.

## 4. Kommandoer og events

```ts
type DeviceCommand =
  | {
      type: "light.set";
      deviceId: DeviceId;
      on?: boolean;
      brightness?: number;
      colorTempK?: number;
      rgb?: [number, number, number];
    }
  | {
      type: "lock.set";
      deviceId: DeviceId;
      action: "lock" | "unlock";
      pin: string;
    } // pin verificeres i BFF
  | { type: "climate.setTarget"; deviceId: DeviceId; targetC: number }
  | {
      type: "vacuum.run";
      deviceId: DeviceId;
      action: "start" | "pause" | "dock";
    }
  | {
      type: "media.set";
      deviceId: DeviceId;
      playing: boolean;
      volumePct?: number;
    }
  | { type: "scene.activate"; sceneId: SceneId }
  | { type: "mode.set"; mode: "baby" | "vacation"; active: boolean };

interface CommandResult {
  ok: boolean;
  steps?: { label: string; ok: boolean; error?: AppErrorCode }[]; // scener: pr. handling
  error?: AppErrorCode; // "AUTH_FAILED" | "HA_UNREACHABLE" | "DEVICE_UNAVAILABLE" | "TIMEOUT" | "FORBIDDEN" | "PIN_REQUIRED" | ...
}

type DeviceEvent =
  | { type: "state"; device: Device } // fuld ny device-tilstand
  | { type: "connection"; state: ConnectionState }
  | { type: "notification"; item: NotificationItem };
```

## 5. Historik (energi + klima)

```ts
interface HistoryQuery {
  deviceId: DeviceId;
  metric: "powerW" | "todayKwh" | "temperatureC" | "co2Ppm";
  range: "24h" | "7d";
}
interface HistoryResult {
  points: { t: string; v: number }[];
  unit: string;
}
```

BFF henter fra HA's history-API og nedsampler til maks. 200 punkter pr. svar.

## 6. Scener, tilstande og baby-data

```ts
interface SceneDef {
  id: SceneId; // "goodnight", "baby-mode", ...
  nameKey: string; // i18n-nøgle
  icon: string;
  kindOfScene: "oneShot" | "mode"; // mode = vedvarende (baby, ferie)
  actions: DeviceCommand[]; // typede handlinger
  pinnedOnDashboard: boolean;
  editableBy: "adult";
}

// Babyhændelser – gemmes serverside (BFF) så alle enheder ser det samme.
interface BabyEvent {
  id: string;
  type: "feeding" | "diaper";
  at: string; // ISO 8601 – kan bagudregistreres
  note?: string;
  recordedByRole: Role;
}

interface BabyConfig {
  roomAreaId: AreaId | null;
  whiteNoiseDeviceId: DeviceId | null;
  nightLightDeviceIds: DeviceId[];
  diaperTimer: { enabled: boolean; intervalMin: number };
  comfort: {
    tempMinC: 18;
    tempMaxC: 21;
    humidityMinPct: 40;
    humidityMaxPct: 60;
  };
}
```

## 7. Notifikations-/automatiseringsregler

```ts
interface Rule {
  id: string;
  nameKey: string;
  enabled: boolean;
  trigger:
    // lukket sæt – ingen fri logik i v1
    | { type: "openingWhileMode"; mode: "vacation" }
    | {
        type: "thresholdAbove";
        deviceId: DeviceId;
        metric: "co2Ppm";
        value: number;
        forMin: number;
      }
    | {
        type: "deviceEntersState";
        deviceId: DeviceId;
        state: "stuck" | "jammed";
      }
    | {
        type: "powerDropBelow";
        deviceId: DeviceId;
        watts: number;
        forMin: number;
      }; // "vaskemaskine færdig"
  action: { type: "notify"; severity: "info" | "warning" | "critical" };
}

interface NotificationItem {
  id: string;
  at: string;
  severity: "info" | "warning" | "critical";
  titleKey: string;
  params: Record<string, string | number>; // i18n med parametre
  read: boolean;
}
```

## 8. Persistens i v1

| Data                                                                             | Hvor                                                                                  | Format                                                              |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Enhedstilstande                                                                  | HA (kilden) + query-cache i klient (localStorage, kun læse-fallback)                  | Domænemodel-JSON                                                    |
| Curation, scener, regler, roller, baby-config/-events, parrede enheder, PIN-hash | BFF: JSON-filer i `data/`-mappe (git-ignoreret), atomisk skrivning (write-tmp+rename) | Zod-valideret ved læsning; ukendte felter bevares (fremtidssikring) |
| UI-præferencer (favoritrækkefølge, tema, enhedens rolle-cookie)                  | Klient (localStorage + httpOnly-cookie)                                               | Versioneret nøgle `atlas:v1:*`                                      |

Migrationsstrategi: hvert JSON-dokument har `schemaVersion`; BFF migrerer ved
opstart. Skift til SQLite overvejes først, når filerne overstiger triviel størrelse (ADR ved behov).

## 9. Mapping HA → domæne (resumé)

Fuld tabel i HOME_ASSISTANT_INTEGRATION §5–6. Princip: mapping-funktioner er rene
funktioner `(HaEntity) => Device | Unsupported`, 100 % unit-testede med optagne
HA-payload-fixtures.
