import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingBreathingGraphic } from "@/components/app/landing-breathing-graphic";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";

export function PublicLandingHero() {
  return (
    <section className="space-y-6 text-center">
      <div className="scale-[1.45] pb-10 pt-8">
        <div className="mx-auto w-full">
          <LandingBreathingGraphic />
        </div>
      </div>
      <div className="space-y-3">
        <h1 className="font-serif text-5xl leading-none tracking-tight">
          A quiet private space for work-life balance.
        </h1>
        <p className="mx-auto max-w-sm text-base leading-7 text-muted">
          Anonymous check-ins, small habits, and supportive reflection for days
          that feel a little too full.
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
        Private. Anonymous. Just for you.
      </p>

      <div className="flex flex-col gap-3">
        <PrimaryButton asChild className="w-full">
          <Link href="/signup">
            Create anonymous account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </PrimaryButton>
        <SecondaryButton asChild className="w-full">
          <Link href="/login">Log in</Link>
        </SecondaryButton>
      </div>
    </section>
  );
}
