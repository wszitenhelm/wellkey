import { Button } from "@/components/ui/button";
import type { OrganizationTeamRecord } from "@/lib/types";

type Props = {
  onRemove: (teamId: string) => void;
  pending: boolean;
  team: OrganizationTeamRecord;
};

export function ManagerTeamCard({ onRemove, pending, team }: Props) {
  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">{team.name}</p>
          <p className="mt-1 text-sm text-muted">{team.slug}</p>
        </div>
        <Button disabled={pending} onClick={() => onRemove(team.id)} type="button" variant="ghost">
          Remove
        </Button>
      </div>
    </div>
  );
}
