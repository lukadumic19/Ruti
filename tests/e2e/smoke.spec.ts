import { expect, test } from "@playwright/test";

test("dashboardet indlæses med app-navn og demo-badge", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Overblik", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Demo", { exact: true })).toBeVisible();
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
    page.getByRole("heading", { name: "Overblik", level: 1 }),
  ).toBeVisible();
});

test("health-API svarer med status ok i demo-tilstand", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { status: string; mode: string };
  expect(body.status).toBe("ok");
  expect(body.mode).toBe("demo");
});
