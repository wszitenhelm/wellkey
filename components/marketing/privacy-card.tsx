import { SoftCard } from "@/components/ui/soft-card";

type PrivacyCardProps = {
  title: string;
  description: string;
};

export function PrivacyCard({ title, description }: PrivacyCardProps) {
  return (
    <SoftCard className="rounded-[2rem] border border-black/5 bg-white/70 p-6 shadow-soft">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
    </SoftCard>
  );
}
