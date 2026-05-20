"use client";

import { useEffect, useState } from "react";
import { LandingBreathingGraphic } from "@/components/app/landing-breathing-graphic";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { landingContent } from "@/lib/content/experience";

type DailyLandingProps = {
  onSkip: () => void;
  onStartCheckIn: () => void;
};

export function DailyLanding({ onSkip, onStartCheckIn }: DailyLandingProps) {
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSettled(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.18),transparent_34%),linear-gradient(180deg,#f7f5ef_0%,#f0ebdf_100%)] animate-fade-in">
      <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-between px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] text-center sm:px-6 sm:pb-14 sm:pt-10">
        <div
          className={`flex w-full flex-1 flex-col items-center transition-all duration-1000 ease-out ${
            isSettled ? "justify-start gap-8 pt-10" : "justify-center gap-0"
          }`}
        >
          <LandingBreathingGraphic expanded={!isSettled} />
          <div
            className={`space-y-3 transition-all duration-700 ease-out ${
              isSettled
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-6 opacity-0"
            }`}
          >
            <h1 className="font-serif text-[2.9rem] leading-none tracking-tight sm:text-5xl">
              {landingContent.title}
            </h1>
            <p className="text-lg leading-8 text-foreground/85">{landingContent.body}</p>
            <p className="mx-auto max-w-sm text-sm leading-6 text-muted">
              {landingContent.subtitle}
            </p>
          </div>
        </div>

        <div
          className={`w-full space-y-3 transition-all delay-150 duration-700 ease-out ${
            isSettled
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-6 opacity-0"
          }`}
        >
          <PrimaryButton className="w-full" onClick={onStartCheckIn} type="button">
            {landingContent.primaryCta}
          </PrimaryButton>
          <SecondaryButton className="w-full" onClick={onSkip} type="button">
            {landingContent.secondaryCta}
          </SecondaryButton>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            {landingContent.privacyLine}
          </p>
        </div>
      </div>
    </div>
  );
}
