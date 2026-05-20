import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PublicLandingHero } from "@/components/marketing/public-landing-hero";
import { PrivacyCard } from "@/components/marketing/privacy-card";
import { SoftCard } from "@/components/ui/soft-card";
import { privacyCards } from "@/lib/content/privacy";

export default function HomePage() {
  return (
    <PageShell className="gap-8 py-8">
      <PublicLandingHero />

      <SoftCard className="p-5">
        <div className="flex items-center gap-3 rounded-2xl bg-accent/5 p-4">
          <div className="rounded-full bg-accent/10 p-3 text-accent">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">No email required</p>
            <p className="text-sm text-muted">Your identity never enters the flow.</p>
          </div>
        </div>
      </SoftCard>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Privacy promise
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl">
            What we never ask from you
          </h2>
        </div>
        <div className="grid gap-4">
          {privacyCards.map((card) => (
            <PrivacyCard key={card.title} {...card} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
