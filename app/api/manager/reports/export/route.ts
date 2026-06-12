import { getOrganizationSession } from "@/lib/auth/organization-session";
import {
  createOrganizationReportExport,
  getLatestReportingSnapshot
} from "@/lib/db/organization-reporting";
import { getOrganizationWorkspaceData } from "@/lib/db/organization-workspace";
import { hasOrganizationPermission } from "@/lib/organizations/permissions";

function toCsv(rows: Array<Record<string, string | number | null>>) {
  if (rows.length === 0) {
    return "metric,value\n";
  }

  return [
    Object.keys(rows[0]).join(","),
    ...rows.map((row) =>
      Object.values(row)
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
  ].join("\n");
}

export async function GET() {
  const session = await getOrganizationSession();

  if (!session) {
    return Response.json({ error: "Log in to continue." }, { status: 401 });
  }

  if (!hasOrganizationPermission(session.permissions, "manage_reports")) {
    return Response.json({ error: "You do not have permission to export reports." }, { status: 403 });
  }

  const [workspace, snapshot] = await Promise.all([
    getOrganizationWorkspaceData(session),
    getLatestReportingSnapshot(session)
  ]);

  const rows = [
    { metric: "organization", value: workspace.organization.display_name },
    { metric: "verification_status", value: workspace.organization.verification_status },
    { metric: "primary_domain", value: workspace.organization.primary_domain ?? "" },
    { metric: "latest_snapshot_date", value: snapshot?.date ?? "" },
    { metric: "active_employee_count", value: snapshot?.active_employee_count ?? 0 },
    { metric: "eligible_reporting_count", value: snapshot?.eligible_reporting_count ?? 0 },
    { metric: "avg_risk_score", value: snapshot?.avg_risk_score ?? "" },
    { metric: "median_risk_score", value: snapshot?.median_risk_score ?? "" },
    { metric: "avg_exhaustion", value: snapshot?.avg_e ?? "" },
    { metric: "avg_sleep_strain", value: snapshot?.avg_s ?? "" },
    { metric: "avg_priority_strain", value: snapshot?.avg_p ?? "" },
    { metric: "avg_workload_pressure", value: snapshot?.avg_w ?? "" }
  ];

  await createOrganizationReportExport(session, {
    kind: "current_status_export"
  });

  return new Response(toCsv(rows), {
    headers: {
      "Content-Disposition": 'attachment; filename="wellkey-current-status.csv"',
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
