import { describe, expect, it } from "vitest";

import { parseClientEnv, parseServerEnv } from "./env";

describe("parseServerEnv", () => {
  it("bruger demo-tilstand som standard uden HA-variabler", () => {
    const env = parseServerEnv({});
    expect(env.APP_MODE).toBe("demo");
    expect(env.DATA_DIR).toBe("./data");
  });

  it("afviser live-tilstand uden HA-forbindelsesoplysninger", () => {
    expect(() => parseServerEnv({ APP_MODE: "live" })).toThrowError(
      /HA_URL|HA_TOKEN/,
    );
  });

  it("accepterer live-tilstand med komplet HA-konfiguration", () => {
    const env = parseServerEnv({
      APP_MODE: "live",
      HA_URL: "http://homeassistant.local:8123",
      HA_WS_URL: "ws://homeassistant.local:8123/api/websocket",
      HA_TOKEN: "et-token",
    });
    expect(env.APP_MODE).toBe("live");
    expect(env.HA_TOKEN).toBe("et-token");
  });

  it("afviser ugyldig APP_MODE", () => {
    expect(() => parseServerEnv({ APP_MODE: "prod" })).toThrowError(
      /miljøkonfiguration/,
    );
  });
});

describe("parseClientEnv", () => {
  it("bruger development som standard", () => {
    expect(parseClientEnv({}).NEXT_PUBLIC_APP_ENV).toBe("development");
  });
});
