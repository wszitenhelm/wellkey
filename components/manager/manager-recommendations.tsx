import type { ManagerRecommendation } from "@/lib/types";
import { SoftCard } from "@/components/ui/soft-card";

type ManagerRecommendationsProps = {
  recommendations: ManagerRecommendation[];
};

export function ManagerRecommendations({ recommendations }: ManagerRecommendationsProps) {
  return (
    <SoftCard className="space-y-5 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          Countermeasures
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Suggested manager actions based on the strongest recent team signals.
        </p>
      </div>
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div key={recommendation.title} className="rounded-[1.5rem] bg-white/70 p-4">
            <p className="font-semibold text-foreground">{recommendation.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{recommendation.body}</p>
          </div>
        ))}
      </div>
    </SoftCard>
  );
}
