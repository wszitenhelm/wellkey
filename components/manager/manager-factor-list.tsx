import type { ManagerFactor } from "@/lib/types";
import { SoftCard } from "@/components/ui/soft-card";

type ManagerFactorListProps = {
  factors: ManagerFactor[];
};

export function ManagerFactorList({ factors }: ManagerFactorListProps) {
  return (
    <SoftCard className="space-y-5 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Top pressure points
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Most frequently named anonymous factors from recent quick check-ins.
        </p>
      </div>
      <div className="space-y-4">
        {factors.length === 0 ? (
          <p className="text-sm text-muted">Not enough quick check-in data yet.</p>
        ) : (
          factors.map((factor) => (
            <div key={factor.label} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <p className="font-medium text-foreground">{factor.label}</p>
                <p className="text-muted">{factor.share}%</p>
              </div>
              <div className="h-2 rounded-full bg-foreground/8">
                <div className="h-full rounded-full bg-accent/80" style={{ width: `${factor.share}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </SoftCard>
  );
}
