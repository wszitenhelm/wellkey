import { ManagerAccessPanel } from "@/components/manager/manager-access-panel";
import { requireOrganizationPermission } from "@/lib/auth/organization-guards";
import { getOrganizationAccessData } from "@/lib/db/organization-access";

export default async function ManagerAccessPage() {
  const session = await requireOrganizationPermission("manage_role_permissions");
  const data = await getOrganizationAccessData(session);

  return <ManagerAccessPanel data={data} />;
}
