import type {
  Area,
  Automation,
  BabyEvent,
  Device,
  DoorLock,
  DoorWindowSensor,
  Entity,
  EntityId,
  Floor,
  Home,
  HouseholdMember,
  Light,
  LightCapabilities,
  LightGroup,
  Room,
  RoomId,
  Scene,
  Sensor,
  Vacuum,
} from "@/types";
import {
  areaId,
  automationId,
  babyEventId,
  deviceId,
  entityId,
  floorId,
  homeId,
  memberId,
  roomId,
  sceneId,
} from "@/types";

/**
 * Et realistisk dansk mock-hjem. Al seed-data samles her – simulatoren og
 * tests bygger ovenpå. Navne er data (ikke UI-tekster) og er derfor danske.
 */
export interface MockHomeData {
  home: Home;
  floors: Floor[];
  rooms: Room[];
  areas: Area[];
  devices: Device[];
  entities: Entity[];
  scenes: Scene[];
  automations: Automation[];
  members: HouseholdMember[];
  babyEvents: BabyEvent[];
}

const SEED_TIME = "2026-07-20T06:30:00.000Z";

/* ------------------------------- Struktur ------------------------------- */

const HOME = homeId("home");
const F_STUE = floorId("floor.stueetage");
const F_SAL = floorId("floor.foerste-sal");

export const ROOMS = {
  stue: roomId("room.stue"),
  spise: roomId("room.spiseomraade"),
  kokken: roomId("room.koekken"),
  sovevaerelse: roomId("room.sovevaerelse"),
  badevaerelse: roomId("room.badevaerelse"),
  entre: roomId("room.entre"),
  boernevaerelse: roomId("room.boernevaerelse"),
} as const;

/* ------------------------------ Entitets-id'er --------------------------- */

export const IDS = {
  // Lys: 5 GU10-spots
  spotKokken1: entityId("light.koekken-spot-1"),
  spotKokken2: entityId("light.koekken-spot-2"),
  spotKokken3: entityId("light.koekken-spot-3"),
  spotBad1: entityId("light.badevaerelse-spot-1"),
  spotBad2: entityId("light.badevaerelse-spot-2"),
  // 7 E27 over spisebordet
  spisebord1: entityId("light.spisebord-1"),
  spisebord2: entityId("light.spisebord-2"),
  spisebord3: entityId("light.spisebord-3"),
  spisebord4: entityId("light.spisebord-4"),
  spisebord5: entityId("light.spisebord-5"),
  spisebord6: entityId("light.spisebord-6"),
  spisebord7: entityId("light.spisebord-7"),
  // Enkeltlamper
  bordlampe: entityId("light.stue-bordlampe"),
  vaeglampe: entityId("light.sovevaerelse-vaeglampe"),
  // Grupper
  gruppeKokken: entityId("group.koekken-spots"),
  gruppeSpisebord: entityId("group.spisebord"),
  gruppeBad: entityId("group.badevaerelse-spots"),
  gruppeAltLys: entityId("group.alt-lys"),
  // Hue Motion Sensor (Entré)
  bevaegelseEntre: entityId("motion.entre"),
  tempEntre: entityId("sensor.entre-temperatur"),
  lysEntre: entityId("sensor.entre-lysniveau"),
  // Sikkerhed
  laasHoveddor: entityId("lock.hoveddoer"),
  doerHoved: entityId("opening.hoveddoer"),
  doerAltan: entityId("opening.altandoer"),
  vindueSove: entityId("opening.sovevaerelse-vindue"),
  vindueBoerne: entityId("opening.boernevaerelse-vindue"),
  vindueKokken: entityId("opening.koekken-vindue"),
  // Klima
  termostatStue: entityId("climate.stue"),
  termostatSove: entityId("climate.sovevaerelse"),
  termostatBoerne: entityId("climate.boernevaerelse"),
  termostatBad: entityId("climate.badevaerelse"),
  // Miljøsensorer
  tempSove: entityId("sensor.sovevaerelse-temperatur"),
  fugtSove: entityId("sensor.sovevaerelse-fugt"),
  tempBoerne: entityId("sensor.boernevaerelse-temperatur"),
  fugtBoerne: entityId("sensor.boernevaerelse-fugt"),
  fugtBad: entityId("sensor.badevaerelse-fugt"),
  co2Boerne: entityId("air.boernevaerelse-co2"),
  luftStue: entityId("air.stue-luftkvalitet"),
  // Øvrige
  stovsuger: entityId("vacuum.robotstoevsuger"),
  energiHjem: entityId("energy.hjem"),
} as const;

export const DEVICE_IDS = {
  dimmerStue: deviceId("device.dimmer-stue"),
  dimmerSove: deviceId("device.dimmer-sovevaerelse"),
  motionEntre: deviceId("device.motion-entre"),
  laasHoveddor: deviceId("device.laas-hoveddoer"),
  stovsuger: deviceId("device.robotstoevsuger"),
} as const;

/* ------------------------------- Hjælpere ------------------------------- */

const HUE_CT = { minK: 2200, maxK: 6500 } as const;

const capsColor: LightCapabilities = {
  dim: true,
  colorTemp: HUE_CT,
  color: true,
};
const capsAmbiance: LightCapabilities = {
  dim: true,
  colorTemp: HUE_CT,
  color: false,
};
const capsDimOnly: LightCapabilities = {
  dim: true,
  colorTemp: null,
  color: false,
};

interface LightSpec {
  id: EntityId;
  name: string;
  roomId: RoomId;
  bulb: Light["bulb"];
  capabilities: LightCapabilities;
  deviceName: string;
  model: string;
  on?: boolean;
  brightnessPct?: number;
}

function makeLight(spec: LightSpec): { light: Light; device: Device } {
  const devId = deviceId(`device.${spec.id}`);
  const on = spec.on ?? false;
  const light: Light = {
    kind: "light",
    id: spec.id,
    name: spec.name,
    roomId: spec.roomId,
    deviceId: devId,
    availability: "available",
    lastUpdated: SEED_TIME,
    bulb: spec.bulb,
    capabilities: spec.capabilities,
    state: {
      on,
      brightnessPct: spec.capabilities.dim ? (spec.brightnessPct ?? 80) : null,
      colorTempK: spec.capabilities.colorTemp ? 2700 : null,
      colorRgb: null,
    },
  };
  const device: Device = {
    id: devId,
    name: spec.deviceName,
    manufacturer: "Signify",
    model: spec.model,
    roomId: spec.roomId,
    connectivity: "online",
    battery: null,
    entityIds: [spec.id],
  };
  return { light, device };
}

function makeGroup(
  id: EntityId,
  name: string,
  room: RoomId | null,
  members: readonly Light[],
): LightGroup {
  const capabilities: LightCapabilities = {
    dim: members.every((m) => m.capabilities.dim),
    colorTemp: members.every((m) => m.capabilities.colorTemp) ? HUE_CT : null,
    color: members.every((m) => m.capabilities.color),
  };
  const onMembers = members.filter((m) => m.state.on);
  const dimValues = onMembers
    .map((m) => m.state.brightnessPct)
    .filter((v): v is number => v !== null);
  return {
    kind: "lightGroup",
    id,
    name,
    roomId: room,
    deviceId: null,
    availability: "available",
    lastUpdated: SEED_TIME,
    memberIds: members.map((m) => m.id),
    capabilities,
    state: {
      on: onMembers.length > 0,
      brightnessPct:
        dimValues.length > 0
          ? Math.round(dimValues.reduce((a, b) => a + b, 0) / dimValues.length)
          : null,
    },
  };
}

function makeSensor(
  id: EntityId,
  name: string,
  room: RoomId,
  metric: Sensor["metric"],
  value: number,
  devId: Device["id"] | null = null,
): Sensor {
  const unit =
    metric === "temperature" ? "°C" : metric === "humidity" ? "%" : "lx";
  return {
    kind: "sensor",
    id,
    name,
    roomId: room,
    deviceId: devId,
    availability: "available",
    lastUpdated: SEED_TIME,
    metric,
    unit,
    state: { value },
  };
}

function makeOpening(
  id: EntityId,
  name: string,
  room: RoomId,
  openingType: DoorWindowSensor["openingType"],
): DoorWindowSensor {
  return {
    kind: "doorWindow",
    id,
    name,
    roomId: room,
    deviceId: deviceId(`device.${id}`),
    availability: "available",
    lastUpdated: SEED_TIME,
    openingType,
    state: { open: false, openSince: null },
  };
}

function sensorDevice(
  name: string,
  room: RoomId,
  model: string,
  entityIds: readonly EntityId[],
  batteryPct: number,
): Device {
  return {
    id: deviceId(`device.${entityIds[0]}`),
    name,
    manufacturer: "Aqara",
    model,
    roomId: room,
    connectivity: "online",
    battery: { pct: batteryPct, charging: false },
    entityIds,
  };
}

/* -------------------------------- Byg hjem ------------------------------- */

export function buildMockHome(): MockHomeData {
  const home: Home = { id: HOME, name: "Hjemmet" };

  const floors: Floor[] = [
    { id: F_STUE, homeId: HOME, name: "Stueetage", level: 0 },
    { id: F_SAL, homeId: HOME, name: "1. sal", level: 1 },
  ];

  const rooms: Room[] = [
    { id: ROOMS.stue, floorId: F_STUE, name: "Stue", icon: "sofa" },
    { id: ROOMS.spise, floorId: F_STUE, name: "Spiseområde", icon: "utensils" },
    { id: ROOMS.kokken, floorId: F_STUE, name: "Køkken", icon: "cooking-pot" },
    { id: ROOMS.entre, floorId: F_STUE, name: "Entré", icon: "door-open" },
    {
      id: ROOMS.badevaerelse,
      floorId: F_STUE,
      name: "Badeværelse",
      icon: "bath",
    },
    {
      id: ROOMS.sovevaerelse,
      floorId: F_SAL,
      name: "Soveværelse",
      icon: "bed",
    },
    {
      id: ROOMS.boernevaerelse,
      floorId: F_SAL,
      name: "Børneværelse",
      icon: "baby",
    },
  ];

  const areas: Area[] = [
    {
      id: areaId("area.faellesrum"),
      name: "Fællesrum",
      roomIds: [ROOMS.stue, ROOMS.spise, ROOMS.kokken],
    },
    {
      id: areaId("area.soverum"),
      name: "Soverum",
      roomIds: [ROOMS.sovevaerelse, ROOMS.boernevaerelse],
    },
  ];

  /* Lys: 5 GU10-spots (3 i køkken, 2 på badeværelset) */
  const gu10 = (id: EntityId, n: number, room: RoomId, roomName: string) =>
    makeLight({
      id,
      name: `Spot ${n}`,
      roomId: room,
      bulb: "gu10",
      capabilities: capsAmbiance,
      deviceName: `Hue GU10-spot ${roomName} ${n}`,
      model: "Hue White Ambiance GU10",
    });

  const kokkenSpots = [
    gu10(IDS.spotKokken1, 1, ROOMS.kokken, "køkken"),
    gu10(IDS.spotKokken2, 2, ROOMS.kokken, "køkken"),
    gu10(IDS.spotKokken3, 3, ROOMS.kokken, "køkken"),
  ];
  const badSpots = [
    gu10(IDS.spotBad1, 1, ROOMS.badevaerelse, "badeværelse"),
    gu10(IDS.spotBad2, 2, ROOMS.badevaerelse, "badeværelse"),
  ];

  /* 7 E27-pærer over spisebordet */
  const spisebordIds = [
    IDS.spisebord1,
    IDS.spisebord2,
    IDS.spisebord3,
    IDS.spisebord4,
    IDS.spisebord5,
    IDS.spisebord6,
    IDS.spisebord7,
  ];
  const spisebord = spisebordIds.map((id, i) =>
    makeLight({
      id,
      name: `Spisebord ${i + 1}`,
      roomId: ROOMS.spise,
      bulb: "e27",
      capabilities: capsColor,
      deviceName: `Hue E27 spisebord ${i + 1}`,
      model: "Hue White & Color E27",
    }),
  );

  /* Enkeltlamper */
  const bordlampe = makeLight({
    id: IDS.bordlampe,
    name: "Bordlampe",
    roomId: ROOMS.stue,
    bulb: "e27",
    capabilities: capsColor,
    deviceName: "Hue E27 bordlampe",
    model: "Hue White & Color E27",
    on: true,
    brightnessPct: 60,
  });
  const vaeglampe = makeLight({
    id: IDS.vaeglampe,
    name: "Væglampe",
    roomId: ROOMS.sovevaerelse,
    bulb: "e14",
    capabilities: capsDimOnly,
    deviceName: "Hue E14 væglampe",
    model: "Hue White E14",
  });

  const allLightSpecs = [
    ...kokkenSpots,
    ...badSpots,
    ...spisebord,
    bordlampe,
    vaeglampe,
  ];
  const allLights = allLightSpecs.map((s) => s.light);

  /* Grupper pr. rum + hele hjemmet */
  const groups: LightGroup[] = [
    makeGroup(
      IDS.gruppeKokken,
      "Køkkenspots",
      ROOMS.kokken,
      kokkenSpots.map((s) => s.light),
    ),
    makeGroup(
      IDS.gruppeSpisebord,
      "Spisebordslys",
      ROOMS.spise,
      spisebord.map((s) => s.light),
    ),
    makeGroup(
      IDS.gruppeBad,
      "Badeværelsesspots",
      ROOMS.badevaerelse,
      badSpots.map((s) => s.light),
    ),
    makeGroup(IDS.gruppeAltLys, "Alt lys", null, allLights),
  ];

  /* Tilbehør: 2 Hue Dimmer Switches + 1 Hue Motion Sensor */
  const dimmerStue: Device = {
    id: DEVICE_IDS.dimmerStue,
    name: "Hue Dimmer Switch (stue)",
    manufacturer: "Signify",
    model: "Hue Dimmer Switch v2",
    roomId: ROOMS.stue,
    connectivity: "online",
    battery: { pct: 86, charging: false },
    entityIds: [],
  };
  const dimmerSove: Device = {
    id: DEVICE_IDS.dimmerSove,
    name: "Hue Dimmer Switch (soveværelse)",
    manufacturer: "Signify",
    model: "Hue Dimmer Switch v2",
    roomId: ROOMS.sovevaerelse,
    connectivity: "online",
    battery: { pct: 34, charging: false },
    entityIds: [],
  };
  const motionEntities: Entity[] = [
    {
      kind: "motion",
      id: IDS.bevaegelseEntre,
      name: "Bevægelse i entré",
      roomId: ROOMS.entre,
      deviceId: DEVICE_IDS.motionEntre,
      availability: "available",
      lastUpdated: SEED_TIME,
      state: { motion: false, lastMotionAt: null },
    },
    makeSensor(
      IDS.tempEntre,
      "Temperatur i entré",
      ROOMS.entre,
      "temperature",
      20.4,
      DEVICE_IDS.motionEntre,
    ),
    makeSensor(
      IDS.lysEntre,
      "Lysniveau i entré",
      ROOMS.entre,
      "illuminance",
      12,
      DEVICE_IDS.motionEntre,
    ),
  ];
  const motionDevice: Device = {
    id: DEVICE_IDS.motionEntre,
    name: "Hue Motion Sensor (entré)",
    manufacturer: "Signify",
    model: "Hue Motion Sensor",
    roomId: ROOMS.entre,
    connectivity: "online",
    battery: { pct: 78, charging: false },
    entityIds: [IDS.bevaegelseEntre, IDS.tempEntre, IDS.lysEntre],
  };

  /* Sikkerhed */
  const laas: DoorLock = {
    kind: "lock",
    id: IDS.laasHoveddor,
    name: "Hoveddør",
    roomId: ROOMS.entre,
    deviceId: DEVICE_IDS.laasHoveddor,
    availability: "available",
    lastUpdated: SEED_TIME,
    state: { status: "locked" },
  };
  const laasDevice: Device = {
    id: DEVICE_IDS.laasHoveddor,
    name: "Smart dørlås",
    manufacturer: "Nuki",
    model: "Smart Lock 4.0",
    roomId: ROOMS.entre,
    connectivity: "online",
    battery: { pct: 64, charging: false },
    entityIds: [IDS.laasHoveddor],
  };

  const openings: DoorWindowSensor[] = [
    makeOpening(IDS.doerHoved, "Hoveddørssensor", ROOMS.entre, "door"),
    makeOpening(IDS.doerAltan, "Altandør", ROOMS.stue, "door"),
    makeOpening(
      IDS.vindueSove,
      "Soveværelsesvindue",
      ROOMS.sovevaerelse,
      "window",
    ),
    makeOpening(
      IDS.vindueBoerne,
      "Børneværelsesvindue",
      ROOMS.boernevaerelse,
      "window",
    ),
    makeOpening(IDS.vindueKokken, "Køkkenvindue", ROOMS.kokken, "window"),
  ];
  const openingDevices: Device[] = openings.map((o) => ({
    id: deviceId(`device.${o.id}`),
    name: o.name,
    manufacturer: "Aqara",
    model: "Door & Window Sensor P2",
    roomId: o.roomId,
    connectivity: "online",
    battery: { pct: 91, charging: false },
    entityIds: [o.id],
  }));

  /* Klima: termostater */
  const thermostat = (
    id: EntityId,
    name: string,
    room: RoomId,
    currentC: number,
    targetC: number,
  ): Entity => ({
    kind: "thermostat",
    id,
    name,
    roomId: room,
    deviceId: deviceId(`device.${id}`),
    availability: "available",
    lastUpdated: SEED_TIME,
    capabilities: { minC: 5, maxC: 28, stepC: 0.5 },
    state: { currentC, targetC, heating: targetC > currentC },
  });
  const thermostats = [
    thermostat(IDS.termostatStue, "Termostat i stuen", ROOMS.stue, 21.4, 21),
    thermostat(
      IDS.termostatSove,
      "Termostat i soveværelset",
      ROOMS.sovevaerelse,
      18.7,
      18,
    ),
    thermostat(
      IDS.termostatBoerne,
      "Termostat i børneværelset",
      ROOMS.boernevaerelse,
      20.1,
      20,
    ),
    thermostat(
      IDS.termostatBad,
      "Termostat på badeværelset",
      ROOMS.badevaerelse,
      22.3,
      22,
    ),
  ];
  const thermostatDevices: Device[] = thermostats.map((t) => ({
    id: deviceId(`device.${t.id}`),
    name: t.name,
    manufacturer: "Danfoss",
    model: "Ally Radiator Thermostat",
    roomId: t.roomId,
    connectivity: "online",
    battery: { pct: 72, charging: false },
    entityIds: [t.id],
  }));

  /* Temperatur-/fugtsensorer + luftkvalitet */
  const climateSensors: Entity[] = [
    makeSensor(
      IDS.tempSove,
      "Temperatur i soveværelset",
      ROOMS.sovevaerelse,
      "temperature",
      18.7,
    ),
    makeSensor(
      IDS.fugtSove,
      "Luftfugtighed i soveværelset",
      ROOMS.sovevaerelse,
      "humidity",
      48,
    ),
    makeSensor(
      IDS.tempBoerne,
      "Temperatur i børneværelset",
      ROOMS.boernevaerelse,
      "temperature",
      20.1,
    ),
    makeSensor(
      IDS.fugtBoerne,
      "Luftfugtighed i børneværelset",
      ROOMS.boernevaerelse,
      "humidity",
      51,
    ),
    makeSensor(
      IDS.fugtBad,
      "Luftfugtighed på badeværelset",
      ROOMS.badevaerelse,
      "humidity",
      62,
    ),
  ];
  const climateSensorDevices: Device[] = [
    sensorDevice(
      "Klimasensor (soveværelse)",
      ROOMS.sovevaerelse,
      "Temperature & Humidity Sensor",
      [IDS.tempSove, IDS.fugtSove],
      88,
    ),
    sensorDevice(
      "Klimasensor (børneværelse)",
      ROOMS.boernevaerelse,
      "Temperature & Humidity Sensor",
      [IDS.tempBoerne, IDS.fugtBoerne],
      83,
    ),
    sensorDevice(
      "Klimasensor (badeværelse)",
      ROOMS.badevaerelse,
      "Temperature & Humidity Sensor",
      [IDS.fugtBad],
      79,
    ),
  ];

  const airEntities: Entity[] = [
    {
      kind: "airQuality",
      id: IDS.co2Boerne,
      name: "CO₂ i børneværelset",
      roomId: ROOMS.boernevaerelse,
      deviceId: deviceId(`device.${IDS.co2Boerne}`),
      availability: "available",
      lastUpdated: SEED_TIME,
      state: { co2Ppm: 640, pm25: null },
    },
    {
      kind: "airQuality",
      id: IDS.luftStue,
      name: "Luftkvalitet i stuen",
      roomId: ROOMS.stue,
      deviceId: deviceId(`device.${IDS.luftStue}`),
      availability: "available",
      lastUpdated: SEED_TIME,
      state: { co2Ppm: 720, pm25: 6 },
    },
  ];
  const airDevices: Device[] = [
    {
      id: deviceId(`device.${IDS.co2Boerne}`),
      name: "CO₂-sensor (børneværelse)",
      manufacturer: "Netatmo",
      model: "Smart Indoor Air Quality Monitor",
      roomId: ROOMS.boernevaerelse,
      connectivity: "online",
      battery: null,
      entityIds: [IDS.co2Boerne],
    },
    {
      id: deviceId(`device.${IDS.luftStue}`),
      name: "Luftkvalitetsmåler (stue)",
      manufacturer: "Ikea",
      model: "Vindstyrka",
      roomId: ROOMS.stue,
      connectivity: "online",
      battery: null,
      entityIds: [IDS.luftStue],
    },
  ];

  /* Robotstøvsuger + energimåler */
  const stovsuger: Vacuum = {
    kind: "vacuum",
    id: IDS.stovsuger,
    name: "Robotstøvsuger",
    roomId: ROOMS.stue,
    deviceId: DEVICE_IDS.stovsuger,
    availability: "available",
    lastUpdated: SEED_TIME,
    state: { activity: "docked", batteryPct: 100 },
  };
  const stovsugerDevice: Device = {
    id: DEVICE_IDS.stovsuger,
    name: "Robotstøvsuger",
    manufacturer: "Roborock",
    model: "Q8 Max",
    roomId: ROOMS.stue,
    connectivity: "online",
    battery: { pct: 100, charging: true },
    entityIds: [IDS.stovsuger],
  };
  const energi: Entity = {
    kind: "energyMeter",
    id: IDS.energiHjem,
    name: "Hjemmets elforbrug",
    roomId: null,
    deviceId: deviceId(`device.${IDS.energiHjem}`),
    availability: "available",
    lastUpdated: SEED_TIME,
    scope: "home",
    state: { powerW: 412, todayKwh: 3.6 },
  };
  const energiDevice: Device = {
    id: deviceId(`device.${IDS.energiHjem}`),
    name: "Energimåler (eltavle)",
    manufacturer: "Shelly",
    model: "Pro 3EM",
    roomId: null,
    connectivity: "online",
    battery: null,
    entityIds: [IDS.energiHjem],
  };

  /* Scener (de 10 hverdagsscener) */
  const scenes: Scene[] = [
    {
      id: sceneId("scene.godmorgen"),
      name: "Godmorgen",
      icon: "sunrise",
      sceneType: "oneShot",
      active: null,
      pinnedOnDashboard: true,
      actions: [
        {
          service: "light.turnOn",
          entityId: IDS.gruppeKokken,
          brightnessPct: 80,
          colorTempK: 3500,
        },
        {
          service: "light.turnOn",
          entityId: IDS.gruppeSpisebord,
          brightnessPct: 70,
          colorTempK: 3000,
        },
        {
          service: "climate.setTargetTemperature",
          entityId: IDS.termostatStue,
          targetC: 21.5,
        },
      ],
    },
    {
      id: sceneId("scene.vi-gaar-hjemmefra"),
      name: "Vi går hjemmefra",
      icon: "log-out",
      sceneType: "oneShot",
      active: null,
      pinnedOnDashboard: true,
      actions: [
        { service: "light.turnOff", entityId: IDS.gruppeAltLys },
        { service: "lock.lock", entityId: IDS.laasHoveddor },
        {
          service: "vacuum.setActivity",
          entityId: IDS.stovsuger,
          action: "start",
        },
      ],
    },
    {
      id: sceneId("scene.vi-er-hjemme"),
      name: "Vi er hjemme",
      icon: "home",
      sceneType: "oneShot",
      active: null,
      pinnedOnDashboard: false,
      actions: [
        { service: "light.turnOn", entityId: IDS.bordlampe, brightnessPct: 60 },
        {
          service: "vacuum.setActivity",
          entityId: IDS.stovsuger,
          action: "dock",
        },
      ],
    },
    {
      id: sceneId("scene.aften"),
      name: "Aften",
      icon: "sunset",
      sceneType: "oneShot",
      active: null,
      pinnedOnDashboard: false,
      actions: [
        {
          service: "light.turnOn",
          entityId: IDS.bordlampe,
          brightnessPct: 40,
          colorTempK: 2400,
        },
        {
          service: "light.turnOn",
          entityId: IDS.gruppeSpisebord,
          brightnessPct: 35,
          colorTempK: 2400,
        },
        { service: "light.turnOff", entityId: IDS.gruppeKokken },
      ],
    },
    {
      id: sceneId("scene.filmaften"),
      name: "Filmaften",
      icon: "tv",
      sceneType: "oneShot",
      active: null,
      pinnedOnDashboard: false,
      actions: [
        {
          service: "light.turnOn",
          entityId: IDS.bordlampe,
          brightnessPct: 15,
          colorRgb: [255, 147, 41],
        },
        { service: "light.turnOff", entityId: IDS.gruppeSpisebord },
        { service: "light.turnOff", entityId: IDS.gruppeKokken },
      ],
    },
    {
      id: sceneId("scene.godnat"),
      name: "Godnat",
      icon: "moon",
      sceneType: "oneShot",
      active: null,
      pinnedOnDashboard: true,
      actions: [
        { service: "light.turnOff", entityId: IDS.gruppeAltLys },
        { service: "lock.lock", entityId: IDS.laasHoveddor },
        {
          service: "climate.setTargetTemperature",
          entityId: IDS.termostatSove,
          targetC: 17,
        },
      ],
    },
    {
      id: sceneId("scene.babytilstand"),
      name: "Babytilstand",
      icon: "baby",
      sceneType: "mode",
      active: false,
      pinnedOnDashboard: true,
      actions: [
        { service: "light.turnOn", entityId: IDS.vaeglampe, brightnessPct: 10 },
      ],
    },
    {
      id: sceneId("scene.natlys"),
      name: "Natlys",
      icon: "lamp",
      sceneType: "oneShot",
      active: null,
      pinnedOnDashboard: false,
      actions: [
        { service: "light.turnOn", entityId: IDS.vaeglampe, brightnessPct: 5 },
      ],
    },
    {
      id: sceneId("scene.rengoering"),
      name: "Rengøring",
      icon: "sparkles",
      sceneType: "oneShot",
      active: null,
      pinnedOnDashboard: false,
      actions: [
        {
          service: "vacuum.setActivity",
          entityId: IDS.stovsuger,
          action: "start",
        },
        {
          service: "light.turnOn",
          entityId: IDS.gruppeAltLys,
          brightnessPct: 100,
        },
      ],
    },
    {
      id: sceneId("scene.ferietilstand"),
      name: "Ferietilstand",
      icon: "plane",
      sceneType: "mode",
      active: false,
      pinnedOnDashboard: false,
      actions: [
        { service: "light.turnOff", entityId: IDS.gruppeAltLys },
        { service: "lock.lock", entityId: IDS.laasHoveddor },
        {
          service: "climate.setTargetTemperature",
          entityId: IDS.termostatStue,
          targetC: 16,
        },
      ],
    },
  ];

  const automations: Automation[] = [
    {
      id: automationId("automation.natlys-ved-bevaegelse"),
      name: "Natlys ved bevægelse",
      description: "Tænder svagt lys i entréen ved bevægelse om natten.",
      enabled: true,
    },
    {
      id: automationId("automation.sluk-alt-ved-afgang"),
      name: "Sluk alt når sidste person går",
      description: "Slukker alt lys, når hjemmet forlades.",
      enabled: true,
    },
    {
      id: automationId("automation.udluftning"),
      name: "Påmindelse om udluftning",
      description: "Giver besked når CO₂ i børneværelset er for højt.",
      enabled: false,
    },
  ];

  const members: HouseholdMember[] = [
    { id: memberId("member.mor"), name: "Mor", role: "adult" },
    { id: memberId("member.far"), name: "Far", role: "adult" },
    { id: memberId("member.alma"), name: "Alma", role: "child" },
    { id: memberId("member.vaegpanel"), name: "Vægpanel", role: "wallpanel" },
  ];

  const babyEvents: BabyEvent[] = [
    {
      id: babyEventId("baby.event-1"),
      type: "feeding",
      at: "2026-07-20T03:40:00.000Z",
      note: null,
      recordedBy: memberId("member.mor"),
    },
    {
      id: babyEventId("baby.event-2"),
      type: "diaper",
      at: "2026-07-20T03:55:00.000Z",
      note: null,
      recordedBy: memberId("member.mor"),
    },
  ];

  const entities: Entity[] = [
    ...allLights,
    ...groups,
    ...motionEntities,
    laas,
    ...openings,
    ...thermostats,
    ...climateSensors,
    ...airEntities,
    stovsuger,
    energi,
  ];

  const devices: Device[] = [
    ...allLightSpecs.map((s) => s.device),
    dimmerStue,
    dimmerSove,
    motionDevice,
    laasDevice,
    ...openingDevices,
    ...thermostatDevices,
    ...climateSensorDevices,
    ...airDevices,
    stovsugerDevice,
    energiDevice,
  ];

  return {
    home,
    floors,
    rooms,
    areas,
    devices,
    entities,
    scenes,
    automations,
    members,
    babyEvents,
  };
}
