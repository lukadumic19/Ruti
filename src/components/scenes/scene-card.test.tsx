import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Moon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "../../../tests/test-utils";
import { SceneCard } from "./scene-card";

describe("SceneCard", () => {
  it("aktiverer scenen med ét tryk", async () => {
    const onActivate = vi.fn();
    renderWithIntl(
      <SceneCard name="Godnat" icon={Moon} onActivate={onActivate} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Godnat/ }));
    expect(onActivate).toHaveBeenCalledOnce();
  });

  it("viser aktiv tilstand med tekst og aria-pressed", () => {
    renderWithIntl(
      <SceneCard name="Babytilstand" icon={Moon} active onActivate={vi.fn()} />,
    );
    const button = screen.getByRole("button", { name: /Babytilstand/ });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Aktiv")).toBeInTheDocument();
  });

  it("blokerer dobbeltaktivering mens scenen kører", () => {
    const onActivate = vi.fn();
    renderWithIntl(
      <SceneCard name="Godnat" icon={Moon} busy onActivate={onActivate} />,
    );
    const button = screen.getByRole("button", { name: /Godnat/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Arbejder…")).toBeInTheDocument();
  });
});
