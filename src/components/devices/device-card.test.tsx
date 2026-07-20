import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Lamp } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "../../../tests/test-utils";
import { DeviceCard } from "./device-card";

describe("DeviceCard", () => {
  it("viser navn og status som tekst (aldrig kun farve)", () => {
    renderWithIntl(<DeviceCard name="Gulvlampe" icon={Lamp} status="on" />);
    expect(screen.getByText("Gulvlampe")).toBeInTheDocument();
    expect(screen.getByText("Tændt")).toBeInTheDocument();
  });

  it("kontakten afspejler tilstanden og kalder onToggle", async () => {
    const onToggle = vi.fn();
    renderWithIntl(
      <DeviceCard
        name="Gulvlampe"
        icon={Lamp}
        status="on"
        onToggle={onToggle}
      />,
    );
    const toggle = screen.getByRole("switch", { name: "Gulvlampe" });
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("deaktiverer kontakten og viser tekst når enheden er utilgængelig", () => {
    renderWithIntl(
      <DeviceCard
        name="Vindueslampe"
        icon={Lamp}
        status="unavailable"
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByRole("switch", { name: "Vindueslampe" })).toBeDisabled();
    expect(screen.getByText("Ikke tilgængelig")).toBeInTheDocument();
  });

  it("viser fejlbesked ved fejltilstand", () => {
    renderWithIntl(
      <DeviceCard
        name="Hoveddør"
        icon={Lamp}
        status="error"
        statusLabel="Låsen svarer ikke"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Låsen svarer ikke");
  });
});
