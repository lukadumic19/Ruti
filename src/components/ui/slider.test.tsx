import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { Slider } from "./slider";

function ControlledSlider() {
  const [value, setValue] = React.useState(50);
  return (
    <Slider
      min={0}
      max={100}
      step={1}
      value={[value]}
      onValueChange={([v]) => {
        if (v !== undefined) setValue(v);
      }}
      thumbLabel="Lysstyrke"
      valueText={`${value} %`}
    />
  );
}

describe("Slider", () => {
  it("eksponerer slider-rolle med navn og værdier", () => {
    render(<ControlledSlider />);
    const thumb = screen.getByRole("slider", { name: "Lysstyrke" });
    expect(thumb).toHaveAttribute("aria-valuenow", "50");
    expect(thumb).toHaveAttribute("aria-valuemin", "0");
    expect(thumb).toHaveAttribute("aria-valuemax", "100");
    expect(thumb).toHaveAttribute("aria-valuetext", "50 %");
  });

  it("kan justeres med piletaster", async () => {
    render(<ControlledSlider />);
    const thumb = screen.getByRole("slider", { name: "Lysstyrke" });
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "51");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(thumb).toHaveAttribute("aria-valuenow", "49");
  });
});
