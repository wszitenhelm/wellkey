import { ManagerReportingPanel } from "@/components/manager/manager-reporting-panel";
import { requireOrganizationPermission } from "@/lib/auth/organization-guards";
import {
  getLatestReportingSnapshot,
  getOrganizationReportHistory
} from "@/lib/db/organization-reporting";
import { getOrganizationWorkspaceData } from "@/lib/db/organization-workspace";

export default async function ManagerReportingPage() {
  const session = await requireOrganizationPermission("view_reports");
  const [workspace, history, snapshot] = await Promise.all([
    getOrganizationWorkspaceData(session),
    getOrganizationReportHistory(session),
    getLatestReportingSnapshot(session)
  ]);

  return <ManagerReportingPanel history={history} snapshot={snapshot} workspace={workspace} />;
}
