import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { House } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "../../../tests/test-utils";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("viser titel og beskrivelse", () => {
    renderWithIntl(
      <EmptyState icon={House} title="Ingen rum" description="Kommer senere" />,
    );
    expect(screen.getByText("Ingen rum")).toBeInTheDocument();
    expect(screen.getByText("Kommer senere")).toBeInTheDocument();
  });

  it("kalder handlingen ved klik", async () => {
    const onClick = vi.fn();
    renderWithIntl(
      <EmptyState title="Tomt" action={{ label: "Tilføj", onClick }} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Tilføj" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
