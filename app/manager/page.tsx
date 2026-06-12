export const dynamic = "force-dynamic";

import { ManagerDashboard } from "@/components/manager/manager-dashboard";
import { requireOrganizationPermission } from "@/lib/auth/organization-guards";
import { getManagerDashboardData } from "@/lib/db/manager-dashboard";

export default async function ManagerPage() {
  const session = await requireOrganizationPermission("view_org_overview");
  const data = await getManagerDashboardData(session);

  return <ManagerDashboard data={data} />;
}
