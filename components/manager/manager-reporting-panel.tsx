import { hasOrganizationPermission } from "@/lib/organizations/permissions";
import { SoftCard } from "@/components/ui/soft-card";
import { Button } from "@/components/ui/button";
import type {
  OrganizationReportHistoryItem,
  OrganizationWorkspaceData
} from "@/lib/types";

type Snapshot = {
  active_employee_count: number;
  avg_e: number | null;
  avg_p: number | null;
  avg_risk_score: number | null;
  avg_s: number | null;
  avg_w: number | null;
  date: string;
  eligible_reporting_count: number;
  median_risk_score: number | null;
} | null;

type Props = {
  history: OrganizationReportHistoryItem[];
  snapshot: Snapshot;
  workspace: OrganizationWorkspaceData;
};

export function ManagerReportingPanel({ history, snapshot, workspace }: Props) {
  const canExport = hasOrganizationPermission(workspace.permissions, "manage_reports");

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SoftCard className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Reporting</p>
          <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Current status export</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Download a lightweight CSV snapshot with your current organization status and latest
            aggregate wellbeing signals.
          </p>
          {canExport ? (
            <Button asChild className="mt-6">
              <a href="/api/manager/reports/export">Export current status</a>
            </Button>
          ) : (
            <p className="mt-6 text-sm text-muted">
              Your current role can view reports, but exports are limited to report managers.
            </p>
          )}
        </SoftCard>

        <SoftCard className="p-6">
          <p className="text-sm text-muted">Latest snapshot</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground/85">
            <li>Date: {snapshot?.date ?? "No aggregate data yet"}</li>
            <li>Eligible responses: {snapshot?.eligible_reporting_count ?? 0}</li>
            <li>Active employees: {snapshot?.active_employee_count ?? 0}</li>
            <li>Average risk score: {snapshot?.avg_risk_score ?? "Not enough data yet"}</li>
          </ul>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
            {workspace.settings.show_export_button ? "Export enabled" : "Export disabled"}
          </p>
        </SoftCard>
      </div>

      <SoftCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">History</p>
        <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Recent exports</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          A lightweight trail of generated reports so leadership and HR can work from the same
          anonymous aggregate snapshots.
        </p>
        <div className="mt-6 space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-muted">No exports yet. Your first CSV will appear here.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
                <p className="font-medium">
                  {item.export_format.toUpperCase()} · {item.status}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {item.period_start} to {item.period_end}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{item.created_at}</p>
              </div>
            ))
          )}
        </div>
      </SoftCard>
    </div>
  );
}
