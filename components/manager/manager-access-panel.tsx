import { ManagerBadge } from "@/components/manager/manager-badge";
import { ManagerEmptyState } from "@/components/manager/manager-empty-state";
import { ManagerAccessUserRow } from "@/components/manager/manager-access-user-row";
import { SoftCard } from "@/components/ui/soft-card";
import { getOrganizationPermissionLabel } from "@/lib/organizations/labels";
import type { OrganizationAccessData } from "@/lib/types";

type Props = {
  data: OrganizationAccessData;
};

export function ManagerAccessPanel({ data }: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <SoftCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Roles</p>
        <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Permission model</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Roles define what each organization user can see or manage inside the workspace.
        </p>
        <div className="mt-6 space-y-3">
          {data.roles.length === 0 ? (
            <ManagerEmptyState
              body="As you add organization roles, the workspace will show their permission bundles here."
              title="No roles available yet"
            />
          ) : (
            data.roles.map((role) => (
              <div key={role.id} className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
                <div className="flex items-center gap-3">
                  <p className="font-medium">{role.name}</p>
                  {role.is_system ? <ManagerBadge tone="teal">System role</ManagerBadge> : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {role.permissionKeys.length === 0 ? (
                    <p className="text-sm text-muted">No permissions assigned yet.</p>
                  ) : (
                    role.permissionKeys.map((permission) => (
                      <ManagerBadge key={permission}>{getOrganizationPermissionLabel(permission)}</ManagerBadge>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SoftCard>

      <SoftCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Org users</p>
        <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Who can see what</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Assign one primary workspace role to each organization user.
        </p>
        <div className="mt-6 space-y-3">
          {data.users.length === 0 ? (
            <ManagerEmptyState
              body="Team members with workspace access will appear here once they sign in with an organization account."
              title="No organization users yet"
            />
          ) : (
            data.users.map((user) => (
              <ManagerAccessUserRow key={user.id} roles={data.roles} user={user} />
            ))
          )}
        </div>
      </SoftCard>
    </div>
  );
}
