export const dynamic = "force-dynamic";

import { ManagerDashboard } from "@/components/manager/manager-dashboard";
import { getManagerDashboardData } from "@/lib/db/manager-dashboard";

export default async function ManagerPage() {
  const data = await getManagerDashboardData();

  return <ManagerDashboard data={data} />;
}
