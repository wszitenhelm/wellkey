import { SoftCard } from "@/components/ui/soft-card";

type InsightCardProps = {
  body: string;
  title: string;
};

export function InsightCard({ body, title }: InsightCardProps) {
  return (
    <SoftCard className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
        {title}
      </p>
      <p className="mt-3 text-base leading-7 text-foreground">{body}</p>
    </SoftCard>
  );
}
