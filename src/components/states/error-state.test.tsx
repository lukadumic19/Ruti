import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "../../../tests/test-utils";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("viser standardtekster fra beskedfilen og kalder retry", async () => {
    const onRetry = vi.fn();
    renderWithIntl(<ErrorState onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Noget gik galt")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Prøv igen" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("kan overstyre titel og beskrivelse", () => {
    renderWithIntl(<ErrorState title="Ups" description="Detaljer her" />);
    expect(screen.getByText("Ups")).toBeInTheDocument();
    expect(screen.getByText("Detaljer her")).toBeInTheDocument();
  });
});
