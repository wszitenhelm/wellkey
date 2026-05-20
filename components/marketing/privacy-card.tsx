import { SoftCard } from "@/components/ui/soft-card";

type PrivacyCardProps = {
  title: string;
  description: string;
};

export function PrivacyCard({ title, description }: PrivacyCardProps) {
  return (
    <SoftCard className="p-5">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
    </SoftCard>
  );
}
