import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithIntl } from "../../../../tests/test-utils";
import type { HomeStatusItem } from "@/features/dashboard/derive";

import { HomeStatusSummary } from "./home-status-summary";

describe("HomeStatusSummary", () => {
  it("viser låst hjem, lukkede døre og tændt lys", () => {
    const items: HomeStatusItem[] = [
      { kind: "lock", locked: true, jammed: false, severity: "good" },
      { kind: "openings", count: 0, severity: "good" },
      { kind: "lightsOn", count: 3, severity: "info" },
    ];
    renderWithIntl(<HomeStatusSummary items={items} />);
    expect(screen.getByText("Hjemmet er låst")).toBeInTheDocument();
    expect(
      screen.getByText("Alle døre og vinduer er lukkede"),
    ).toBeInTheDocument();
    expect(screen.getByText("3 lamper er tændt")).toBeInTheDocument();
  });

  it("viser offline-status som tekst", () => {
    const items: HomeStatusItem[] = [
      { kind: "offline", count: 1, severity: "warning" },
    ];
    renderWithIntl(<HomeStatusSummary items={items} />);
    expect(screen.getByText("En enhed er offline")).toBeInTheDocument();
  });

  it("viser åbne døre/vinduer i flertal", () => {
    const items: HomeStatusItem[] = [
      { kind: "openings", count: 3, severity: "warning" },
    ];
    renderWithIntl(<HomeStatusSummary items={items} />);
    expect(screen.getByText("3 døre og vinduer står åbne")).toBeInTheDocument();
  });

  it("viser fastklemt lås", () => {
    const items: HomeStatusItem[] = [
      { kind: "lock", locked: false, jammed: true, severity: "critical" },
    ];
    renderWithIntl(<HomeStatusSummary items={items} />);
    expect(screen.getByText("Låsen svarer ikke")).toBeInTheDocument();
  });
});
