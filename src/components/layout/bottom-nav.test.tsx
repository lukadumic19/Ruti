import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "../../../tests/test-utils";
import { BottomNav } from "./bottom-nav";
import { navItems } from "./nav-items";

vi.mock("next/navigation", () => ({
  usePathname: () => "/rum",
}));

describe("BottomNav", () => {
  it("viser alle navigationspunkter med dansk tekst", () => {
    renderWithIntl(<BottomNav />);
    for (const label of ["Hjem", "Rum", "Scener", "Baby", "Mere"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("link")).toHaveLength(navItems.length);
  });

  it("markerer den aktive side med aria-current", () => {
    renderWithIntl(<BottomNav />);
    expect(screen.getByRole("link", { name: "Rum" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Hjem" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
