import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithIntl } from "../../../tests/test-utils";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

function ExampleDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Åbn</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Omdøb rum</DialogTitle>
          <DialogDescription>Vælg et nyt navn.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("åbner ved klik og har tilgængeligt navn", async () => {
    renderWithIntl(<ExampleDialog />);
    await userEvent.click(screen.getByRole("button", { name: "Åbn" }));
    const dialog = screen.getByRole("dialog", { name: "Omdøb rum" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Vælg et nyt navn.")).toBeInTheDocument();
  });

  it("lukker med Escape og med luk-knappen", async () => {
    renderWithIntl(<ExampleDialog />);
    await userEvent.click(screen.getByRole("button", { name: "Åbn" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Åbn" }));
    await userEvent.click(screen.getByRole("button", { name: "Luk" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
