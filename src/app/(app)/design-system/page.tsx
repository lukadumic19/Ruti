import type { Metadata } from "next";

import { DesignSystemPage } from "@/features/design-system/design-system-page";

export const metadata: Metadata = {
  title: "Designsystem",
  robots: { index: false },
};

export default function Page() {
  return <DesignSystemPage />;
}
