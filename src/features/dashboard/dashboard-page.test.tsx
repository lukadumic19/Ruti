import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { renderWithIntl } from "../../../tests/test-utils";
import { HomeProviderScope } from "@/features/home/home-provider-context";
import { MockHomeProvider } from "@/lib/mock/mock-provider";
import { IDS } from "@/lib/mock/seed";

import { DashboardPage } from "./dashboard-page";

/**
 * Integrationstest: dashboardet mod en rigtig MockHomeProvider. Bruger korte
 * latenser og slår simulatoren fra (tickIntervalMs: 0), så testene er stabile.
 */
describe("DashboardPage (integration)", () => {
  let provider: MockHomeProvider;

  beforeEach(async () => {
    provider = new MockHomeProvider({
      commandLatencyMs: 5,
      connectDelayMs: 0,
      tickIntervalMs: 0,
      lockTransitionMs: 5,
    });
    await provider.connect();
  });

  afterEach(async () => {
    await provider.disconnect();
  });

  function renderDashboard() {
    return renderWithIntl(
      <HomeProviderScope provider={provider}>
        <DashboardPage />
      </HomeProviderScope>,
    );
  }

  it("indlæser og viser hjemmestatus og hurtighandlinger", async () => {
    renderDashboard();
    // Hjemmet er låst fra start
    expect(await screen.findByText("Hjemmet er låst")).toBeInTheDocument();
    // Bordlampen er tændt fra start → én lampe
    expect(screen.getByText("Én lampe er tændt")).toBeInTheDocument();
    // Hurtighandlinger findes
    expect(screen.getByRole("button", { name: /Godnat/ })).toBeInTheDocument();
  });

  it("reagerer på mock-stateændringer (fastklemt lås giver advarsel)", async () => {
    renderDashboard();
    await screen.findByText("Hjemmet er låst");

    await act(async () => {
      provider.setLockJammed(IDS.laasHoveddor, true);
    });

    // Advarslen er unik for warnings-sektionen; statuslinjen + notifikationen
    // deler teksten "Låsen svarer ikke", derfor findAllByText for den.
    expect(
      await screen.findByText("Hoveddør sidder fast – tjek døren"),
    ).toBeInTheDocument();
    expect(
      (await screen.findAllByText("Låsen svarer ikke")).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("hurtighandlingen Godnat slukker alt lys via provideren", async () => {
    const user = userEvent.setup();
    renderDashboard();
    expect(await screen.findByText("Én lampe er tændt")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Godnat/ }));

    await waitFor(() =>
      expect(screen.getByText("Intet lys er tændt")).toBeInTheDocument(),
    );
  });

  it("viser offline-banner når forbindelsen tabes", async () => {
    renderDashboard();
    await screen.findByText("Hjemmet er låst");

    await act(async () => {
      provider.simulateConnectionLoss({ reconnectAfterMs: null });
    });

    expect(
      await screen.findByText("Ingen forbindelse til hjemmet"),
    ).toBeInTheDocument();
  });
});
