"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";

type PublicLandingHeroProps = {
  isSettled: boolean;
};

export function PublicLandingHero({ isSettled }: PublicLandingHeroProps) {
  return (
    <section className="relative min-h-[min(34rem,calc(100dvh-9rem))] px-0 text-center lg:min-h-[40rem] lg:text-left">
      <div
        className={`relative z-20 flex min-h-[min(34rem,calc(100dvh-9rem))] flex-col justify-end pb-2 pt-8 transition-all delay-[900ms] duration-[900ms] ease-out sm:min-h-[min(38rem,calc(100dvh-10rem))] sm:pb-4 sm:pt-10 lg:min-h-[40rem] lg:pb-8 lg:pt-16 ${
          isSettled
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-none flex-col items-center space-y-4 px-1 sm:px-2 md:max-w-3xl lg:mx-0 lg:max-w-2xl lg:items-start lg:px-0">
          <h1 className="text-balance font-serif text-[clamp(2.9rem,7vw,6rem)] leading-[0.92] tracking-tight">
            A quiet private space for work-life balance.
          </h1>
          <p className="max-w-xl text-pretty text-base leading-7 text-muted sm:text-lg">
            Private reflection, supportive conversation, and small steps that help work feel a
            little lighter.
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Private. Anonymous. Just for you.
          </p>
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-3 lg:mx-0">
          <PrimaryButton asChild className="w-full">
            <a href="/sign-up">
              Create anonymous account
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </PrimaryButton>
          <SecondaryButton asChild className="w-full">
            <Link href="/login">Log in</Link>
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}
