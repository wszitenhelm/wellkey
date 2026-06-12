import { ManagerAccessUserRow } from "@/components/manager/manager-access-user-row";
import { SoftCard } from "@/components/ui/soft-card";
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
        <div className="mt-6 space-y-3">
          {data.roles.map((role) => (
            <div key={role.id} className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
              <p className="font-medium">{role.name}</p>
              <p className="mt-2 text-sm text-muted">{role.permissionKeys.join(", ") || "No permissions assigned yet."}</p>
            </div>
          ))}
        </div>
      </SoftCard>

      <SoftCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Org users</p>
        <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Who can see what</h2>
        <div className="mt-6 space-y-3">
          {data.users.map((user) => (
            <ManagerAccessUserRow key={user.id} roles={data.roles} user={user} />
          ))}
        </div>
      </SoftCard>
    </div>
  );
}
