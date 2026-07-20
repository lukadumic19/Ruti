import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "../../../tests/test-utils";
import { OfflineBanner } from "./offline-banner";

describe("OfflineBanner", () => {
  it("viser offline-besked med role=status og retry-knap", async () => {
    const onRetry = vi.fn();
    renderWithIntl(<OfflineBanner state="offline" onRetry={onRetry} />);

    const banner = screen.getByRole("status");
    expect(banner).toHaveTextContent("Ingen forbindelse til hjemmet");
    expect(banner).toHaveTextContent("Handlinger er midlertidigt slået fra");

    await userEvent.click(screen.getByRole("button", { name: "Prøv igen" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("viser genopretter-tilstand uden retry-knap", () => {
    renderWithIntl(<OfflineBanner state="reconnecting" />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Genopretter forbindelse…",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
