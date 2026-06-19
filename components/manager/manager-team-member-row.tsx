import { ManagerBadge } from "@/components/manager/manager-badge";
import { getJoinMethodLabel } from "@/lib/organizations/labels";
import type { OrganizationAnonymousMember, OrganizationTeamRecord } from "@/lib/types";

type Props = {
  member: OrganizationAnonymousMember;
  onAssign: (memberId: string, teamId: string) => void;
  teams: OrganizationTeamRecord[];
};

export function ManagerTeamMemberRow({ member, onAssign, teams }: Props) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-white/70 p-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
      <div>
        <p className="font-medium">{member.org_scoped_employee_id}</p>
        <div className="mt-2">
          <ManagerBadge tone="teal">{getJoinMethodLabel(member.join_method)}</ManagerBadge>
        </div>
      </div>
      <select
        className="h-12 rounded-2xl border border-border bg-white px-4 text-sm"
        defaultValue={member.teamIds[0] ?? ""}
        onChange={(event) => onAssign(member.id, event.target.value)}
      >
        <option value="">No team</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  );
}
