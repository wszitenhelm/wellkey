"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingBreathingGraphic } from "@/components/app/landing-breathing-graphic";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";

export function PublicLandingHero() {
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSettled(true), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[100dvh] overflow-hidden text-center">
      <div
        className={`absolute inset-x-0 transition-all duration-[2200ms] ease-out ${
          isSettled ? "top-0" : "top-1/2 -translate-y-1/2"
        }`}
      >
        <div
          className={`mx-auto transition-all duration-[2200ms] ease-out ${
            isSettled ? "w-full scale-100 px-0 pt-[max(env(safe-area-inset-top),1.5rem)]" : "w-full scale-[2.5] px-0"
          }`}
        >
          <LandingBreathingGraphic expanded={!isSettled} />
        </div>
      </div>

      <div
        className={`relative z-10 flex min-h-[100dvh] flex-col justify-end pb-[calc(env(safe-area-inset-bottom,0px)+2rem)] pt-[max(env(safe-area-inset-top),1.5rem)] transition-all delay-[1600ms] duration-[1200ms] ease-out ${
          isSettled
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-10 opacity-0"
        }`}
      >
        <div className="space-y-3">
          <h1 className="font-serif text-5xl leading-none tracking-tight">
            A quiet private space for work-life balance.
          </h1>
          <p className="mx-auto max-w-sm text-base leading-7 text-muted">
            Anonymous check-ins, small habits, and supportive reflection for days
            that feel a little too full.
          </p>
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Private. Anonymous. Just for you.
        </p>

        <div className="mt-6 flex flex-col gap-3">
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
      </div>
    </section>
  );
}
