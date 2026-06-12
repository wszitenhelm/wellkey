import type { ReactNode } from "react";
import { ManagerSidebar } from "@/components/manager/manager-sidebar";
import { SoftCard } from "@/components/ui/soft-card";
import type { OrganizationWorkspaceData } from "@/lib/types";

type ManagerShellProps = {
  children: ReactNode;
  workspace: OrganizationWorkspaceData;
};

export function ManagerShell({ children, workspace }: ManagerShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(210,232,226,0.9),_transparent_42%),linear-gradient(180deg,#f7f5ef_0%,#f3f0e8_100%)] px-4 py-4 text-foreground md:px-6 md:py-6">
      <div className="mx-auto grid max-w-[1600px] gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ManagerSidebar workspace={workspace} />
        <div className="space-y-4">
          <SoftCard className="p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              {workspace.organization.display_name}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-[0.95] md:text-5xl">
              Organization workspace
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted md:text-base">
              Aggregate-only insights for your company. Anonymous employee notes, chats, and
              individual check-ins remain private by design.
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
              {workspace.permissions.length} active permissions in this workspace
            </p>
          </SoftCard>
          {children}
        </div>
      </div>
    </main>
  );
}
