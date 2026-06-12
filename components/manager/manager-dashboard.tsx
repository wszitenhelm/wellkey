import type { ManagerDashboardData } from "@/lib/types";
import { ManagerFactorList } from "@/components/manager/manager-factor-list";
import { ManagerRecommendations } from "@/components/manager/manager-recommendations";
import { ManagerSignalCard } from "@/components/manager/manager-signal-card";
import { SoftCard } from "@/components/ui/soft-card";

type ManagerDashboardProps = {
  data: ManagerDashboardData;
};

export function ManagerDashboard({ data }: ManagerDashboardProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(210,232,226,0.9),_transparent_42%),linear-gradient(180deg,#f7f5ef_0%,#f3f0e8_100%)] px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8">
        <SoftCard className="grid gap-6 p-8 lg:grid-cols-[1.8fr_1fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Manager overview
            </p>
            <h1 className="font-serif text-5xl leading-[0.95]">
              Anonymous team wellbeing dashboard
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted">
              Aggregate-only signals for burnout pressure, sleep and recovery, support, and
              priority clarity. No names, no individual drill-downs, and no identity matching.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <SoftCard className="p-5">
              <p className="text-sm text-muted">Anonymous check-ins</p>
              <p className="mt-2 text-4xl font-semibold">{data.summary.checkInCount}</p>
            </SoftCard>
            <SoftCard className="p-5">
              <p className="text-sm text-muted">Unique responders</p>
              <p className="mt-2 text-4xl font-semibold">{data.summary.responderCount}</p>
            </SoftCard>
          </div>
        </SoftCard>

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {data.signals.map((signal) => (
            <ManagerSignalCard key={signal.key} signal={signal} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <ManagerFactorList factors={data.topFactors} />
          <ManagerRecommendations recommendations={data.recommendations} />
        </section>
      </div>
    </main>
  );
}
