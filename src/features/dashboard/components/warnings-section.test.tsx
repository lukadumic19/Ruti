import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithIntl } from "../../../../tests/test-utils";
import type { DashboardWarning } from "@/features/dashboard/derive";

import { WarningsSection } from "./warnings-section";

describe("WarningsSection", () => {
  it("viser en positiv tom-tilstand når der ingen advarsler er", () => {
    renderWithIntl(<WarningsSection warnings={[]} />);
    expect(
      screen.getByText("Ingen advarsler – alt ser fint ud"),
    ).toBeInTheDocument();
  });

  it("viser kritisk advarsel om fastklemt lås med alert-rolle", () => {
    const warnings: DashboardWarning[] = [
      { kind: "lockJammed", name: "Hoveddør", severity: "critical" },
    ];
    renderWithIntl(<WarningsSection warnings={warnings} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Hoveddør sidder fast – tjek døren");
  });

  it("viser offline-enhed og lavt batteri", () => {
    const warnings: DashboardWarning[] = [
      { kind: "offlineDevice", name: "Bordlampe", severity: "warning" },
      { kind: "lowBattery", name: "Dimmer", pct: 12, severity: "warning" },
    ];
    renderWithIntl(<WarningsSection warnings={warnings} />);
    expect(screen.getByText("Bordlampe er offline")).toBeInTheDocument();
    expect(screen.getByText("Lavt batteri: Dimmer (12 %)")).toBeInTheDocument();
  });
});
