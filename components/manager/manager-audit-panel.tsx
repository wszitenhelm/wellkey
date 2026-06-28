import { ManagerBadge } from "@/components/manager/manager-badge";
import { ManagerEmptyState } from "@/components/manager/manager-empty-state";
import { SoftCard } from "@/components/ui/soft-card";
import type { OrganizationAuditLogRecord } from "@/lib/types";

type Props = {
  items: OrganizationAuditLogRecord[];
};

function formatAction(action: string) {
  return action.replaceAll("_", " ");
}

export function ManagerAuditPanel({ items }: Props) {
  return (
    <SoftCard className="p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Audit logs</p>
      <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Recent admin activity</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        A lightweight history of sensitive workspace changes like access, team, settings, domain,
        and export actions.
      </p>
      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <ManagerEmptyState
            body="Recent organization actions will appear here once someone updates access, settings, teams, domains, or exports."
            title="No audit activity yet"
          />
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <ManagerBadge tone="teal">{formatAction(item.action)}</ManagerBadge>
                <span className="text-xs uppercase tracking-[0.16em] text-muted">{item.created_at}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-foreground/85">
                {item.actorEmail ?? "Unknown workspace user"}
              </p>
              {Object.keys(item.metadata).length > 0 ? (
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-foreground/[0.03] p-3 text-xs leading-6 text-muted">
                  {JSON.stringify(item.metadata, null, 2)}
                </pre>
              ) : null}
            </div>
          ))
        )}
      </div>
    </SoftCard>
  );
}
