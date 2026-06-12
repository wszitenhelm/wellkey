import { ManagerTeamPanel } from "@/components/manager/manager-team-panel";
import { requireOrganizationPermission } from "@/lib/auth/organization-guards";
import { getOrganizationTeamsData } from "@/lib/db/organization-teams";

export default async function ManagerTeamsPage() {
  const session = await requireOrganizationPermission("manage_org_members");
  const data = await getOrganizationTeamsData(session);

  return <ManagerTeamPanel data={data} />;
}
