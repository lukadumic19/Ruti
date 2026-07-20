import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./switch";

function ControlledSwitch() {
  const [on, setOn] = React.useState(false);
  return <Switch checked={on} onCheckedChange={setOn} aria-label="Lys" />;
}

describe("Switch", () => {
  it("har switch-rolle og skifter ved klik", async () => {
    render(<ControlledSwitch />);
    const toggle = screen.getByRole("switch", { name: "Lys" });
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
  });

  it("kan betjenes med tastatur (mellemrum)", async () => {
    render(<ControlledSwitch />);
    const toggle = screen.getByRole("switch", { name: "Lys" });
    toggle.focus();
    await userEvent.keyboard(" ");
    expect(toggle).toBeChecked();
  });

  it("kalder ikke onCheckedChange når den er deaktiveret", async () => {
    const onChange = vi.fn();
    render(
      <Switch checked disabled onCheckedChange={onChange} aria-label="Lås" />,
    );
    await userEvent.click(screen.getByRole("switch", { name: "Lås" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
