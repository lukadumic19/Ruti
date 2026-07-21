import { DashboardPage } from "@/features/dashboard/dashboard-page";

/**
 * Appens primære dashboard. Al data kommer fra HomeProvider (mock i demo,
 * rigtig HA i F3) via useLiveHome – siden er derfor en klientkomponent.
 */
export default function Page() {
  return <DashboardPage />;
}
