import { defineConfig, devices } from "@playwright/test";

/* I miljøer med en fast Chromium-installation kan stien angives eksplicit. */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    ...(executablePath
      ? {
          // Container-miljøer (fx CI som root) kræver ofte --no-sandbox.
          launchOptions: { executablePath, args: ["--no-sandbox"] },
        }
      : {}),
  },
  projects: [
    // iPhone-viewport, men Chromium-motor: kun Chromium er installeret i CI.
    {
      name: "mobil",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
