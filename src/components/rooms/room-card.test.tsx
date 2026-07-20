import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sofa } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "../../../tests/test-utils";
import { RoomCard } from "./room-card";

describe("RoomCard", () => {
  it("viser navn, dansk formateret temperatur og lys-tekst", () => {
    renderWithIntl(
      <RoomCard
        name="Stue"
        icon={Sofa}
        temperatureC={21.5}
        humidityPct={45}
        lightsLabel="2 lys tændt"
        onPress={vi.fn()}
      />,
    );
    expect(screen.getByText("Stue")).toBeInTheDocument();
    expect(screen.getByText(/21,5\s*°C/)).toBeInTheDocument();
    expect(screen.getByText(/45\s*%/)).toBeInTheDocument();
    expect(screen.getByText("2 lys tændt")).toBeInTheDocument();
  });

  it("kalder onPress ved klik når der ikke er et link", async () => {
    const onPress = vi.fn();
    renderWithIntl(<RoomCard name="Stue" icon={Sofa} onPress={onPress} />);
    await userEvent.click(screen.getByRole("button", { name: /Stue/ }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("renderer som link når href er angivet", () => {
    renderWithIntl(<RoomCard name="Køkken" icon={Sofa} href="/rum/koekken" />);
    expect(screen.getByRole("link", { name: /Køkken/ })).toHaveAttribute(
      "href",
      "/rum/koekken",
    );
  });
});
