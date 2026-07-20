import type { Metadata } from "next";

import { MockPanelPage } from "@/features/mock-panel/mock-panel-page";

export const metadata: Metadata = {
  title: "Mock-kontrolpanel",
  robots: { index: false },
};

export default function Page() {
  return <MockPanelPage />;
}
