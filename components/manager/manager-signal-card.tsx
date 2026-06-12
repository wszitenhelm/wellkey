import type { ManagerSignal } from "@/lib/types";
import { SoftCard } from "@/components/ui/soft-card";

type ManagerSignalCardProps = {
  signal: ManagerSignal;
};

export function ManagerSignalCard({ signal }: ManagerSignalCardProps) {
  const tone = {
    critical: "text-rose-700",
    elevated: "text-amber-700",
    steady: "text-emerald-700",
    watch: "text-sky-700"
  }[signal.level];

  return (
    <SoftCard className="space-y-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            {signal.label}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">{signal.summary}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold capitalize ${tone}`}>{signal.level}</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">
            {signal.percent !== null ? `${signal.percent}%` : "--"}
          </p>
        </div>
      </div>
      <div className="h-2 rounded-full bg-foreground/8">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${signal.percent ?? 8}%` }}
        />
      </div>
      <p className="text-sm text-muted">
        {signal.trend === null
          ? "Trend needs more recent data."
          : signal.trend > 0
            ? `Up ${signal.trend.toFixed(2)} vs previous week.`
            : signal.trend < 0
              ? `Down ${Math.abs(signal.trend).toFixed(2)} vs previous week.`
              : "Flat vs previous week."}
      </p>
    </SoftCard>
  );
}
