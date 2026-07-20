import { describe, expect, it } from "vitest";

import { navItems } from "@/components/layout/nav-items";
import da from "./messages/da.json";

describe("da.json", () => {
  it("har en beskednøgle for hvert navigationspunkt", () => {
    for (const item of navItems) {
      expect(
        da.nav[item.labelKey],
        `mangler nav.${item.labelKey}`,
      ).toBeTruthy();
    }
  });

  it("har ingen tomme tekster", () => {
    const walk = (node: unknown, path: string): void => {
      if (typeof node === "string") {
        expect(node.trim(), `tom tekst ved ${path}`).not.toHaveLength(0);
        return;
      }
      if (node && typeof node === "object") {
        for (const [key, value] of Object.entries(node)) {
          walk(value, `${path}.${key}`);
        }
      }
    };
    walk(da, "da");
  });
});
