import { expect, test } from "@playwright/test";

test("dashboardet indlæses med hilsen, status og hurtighandlinger", async ({
  page,
}) => {
  await page.goto("/");
  // Topområdet viser en situationsafhængig hilsen som h1
  await expect(
    page.getByRole("heading", { level: 1 }).filter({ hasText: /God/ }),
  ).toBeVisible();
  // Hjemmestatus fra mock-data
  await expect(page.getByText("Hjemmet er låst")).toBeVisible();
  // Hurtighandlinger virker mod mock-provideren
  await expect(page.getByRole("button", { name: "Godnat" })).toBeVisible();
  await expect(page.getByText("Demo", { exact: true })).toBeVisible();
});

test("dashboardets hurtighandling Godnat slukker alt lys", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Én lampe er tændt")).toBeVisible();
  await page.getByRole("button", { name: "Godnat" }).click();
  await expect(
    page.getByText("Intet lys er tændt", { exact: true }),
  ).toBeVisible({ timeout: 10_000 });
});

test("designsystem-siden viser komponentoversigten", async ({ page }) => {
  await page.goto("/design-system");
  await expect(
    page.getByRole("heading", { name: "Designsystem", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Kontroller", level: 2 }),
  ).toBeVisible();
  // Et par centrale komponenter renderer med korrekt semantik
  await expect(
    page.getByRole("switch", { name: "Demo-kontakt" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Godnat/ }).first(),
  ).toBeVisible();
});

test("mock-kontrolpanelet styrer mock-hjemmet i realtid", async ({ page }) => {
  await page.goto("/mock-kontrol");
  await expect(
    page.getByRole("heading", { name: "Mock-kontrolpanel", level: 1 }),
  ).toBeVisible();

  // Tænd spisebordsgruppen og se status skifte til Tændt
  const groupSwitch = page.getByRole("switch", { name: "Spisebordslys" });
  await expect(groupSwitch).toBeVisible();
  await expect(async () => {
    await groupSwitch.click();
    await expect(page.getByText("Tændt", { exact: true }).first()).toBeVisible({
      timeout: 2000,
    });
  }).toPass({ timeout: 15_000 });
});

test("simuleret forbindelsestab viser offline-banner og kan genoprettes", async ({
  page,
}) => {
  await page.goto("/mock-kontrol");
  await expect(async () => {
    await page.getByRole("button", { name: "Gå offline" }).click();
    await expect(page.getByText("Ingen forbindelse til hjemmet")).toBeVisible({
      timeout: 2000,
    });
  }).toPass({ timeout: 15_000 });

  await page.getByRole("button", { name: "Genopret", exact: true }).click();
  await expect(page.getByText("Ingen forbindelse til hjemmet")).toBeHidden({
    timeout: 5000,
  });
});

test("navigation til Rum viser tom-tilstand", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Hovedmenu" })
    .first()
    .getByRole("link", { name: "Rum" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Rum", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Ingen rum endnu")).toBeVisible();
});

test("systemstatus viser demo-tilstand og prøvenotifikation virker", async ({
  page,
}) => {
  await page.goto("/status");
  await expect(
    page.getByRole("heading", { name: "Systemstatus", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Demo – eksempeldata").first()).toBeVisible();

  // Gentag klikket, indtil toasten vises – klik før hydration er ellers et no-op.
  await expect(async () => {
    await page.getByRole("button", { name: "Vis prøvenotifikation" }).click();
    await expect(
      page.getByText("Sådan ser en besked fra hjemmet ud."),
    ).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 15_000 });
});

test("ukendt side viser dansk 404", async ({ page }) => {
  await page.goto("/findes-ikke");
  await expect(page.getByText("Siden findes ikke")).toBeVisible();
  await page.getByRole("link", { name: "Til forsiden" }).click();
  await expect(
    page.getByRole("heading", { level: 1 }).filter({ hasText: /God/ }),
  ).toBeVisible();
});

test("health-API svarer med status ok i demo-tilstand", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { status: string; mode: string };
  expect(body.status).toBe("ok");
  expect(body.mode).toBe("demo");
});
