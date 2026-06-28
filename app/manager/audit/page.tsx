import { ManagerAuditPanel } from "@/components/manager/manager-audit-panel";
import { requireOrganizationPermission } from "@/lib/auth/organization-guards";
import { getOrganizationAuditLogs } from "@/lib/db/organization-audit";

export default async function ManagerAuditPage() {
  const session = await requireOrganizationPermission("view_audit_logs");
  const items = await getOrganizationAuditLogs(session);

  return <ManagerAuditPanel items={items} />;
}
