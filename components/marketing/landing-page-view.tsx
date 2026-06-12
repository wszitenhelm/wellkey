"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Content } from "@/components/layout/content";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { LandingBreathingGraphic } from "@/components/app/landing-breathing-graphic";
import { PrivacyCard } from "@/components/marketing/privacy-card";
import { PublicLandingHero } from "@/components/marketing/public-landing-hero";
import type { PrivacyCardContent } from "@/lib/content/privacy";

type LandingPageViewProps = {
  privacyCards: PrivacyCardContent[];
  hasSeenIntro: boolean;
};

export const INTRO_COOKIE = "wellkey_landing_seen";
const INTRO_DURATION_MS = 1800;

export function LandingPageView({ privacyCards, hasSeenIntro }: LandingPageViewProps) {
  const [isSettled, setIsSettled] = useState(hasSeenIntro);

  useEffect(() => {
    if (hasSeenIntro) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsSettled(true);
      document.cookie = `${INTRO_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    }, INTRO_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      <div
        className={`pointer-events-none absolute z-20 transition-all duration-[1800ms] ease-out ${
          isSettled
            ? "left-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] translate-x-0 translate-y-0 sm:left-6 sm:top-[calc(env(safe-area-inset-top,0px)+1.5rem)] lg:left-10 xl:left-12"
            : "left-1/2 top-[44dvh] -translate-x-1/2 -translate-y-1/2"
        }`}
      >
        <div className={`flex items-center ${isSettled ? "gap-3" : "gap-0"}`}>
          <LandingBreathingGraphic
            className={`transition-all duration-[1800ms] ease-out ${
              isSettled
                ? "h-10 w-10 sm:h-11 sm:w-11"
                : "h-[min(78vw,34rem)] w-[min(78vw,34rem)] sm:h-[min(64vw,34rem)] sm:w-[min(64vw,34rem)]"
            }`}
          />
          <span
            className={`overflow-hidden whitespace-nowrap text-sm font-semibold tracking-[0.18em] text-foreground/75 transition-all delay-[1200ms] duration-[500ms] sm:text-base ${
              isSettled ? "max-w-40 translate-x-0 opacity-100" : "max-w-0 translate-x-3 opacity-0"
            }`}
          >
            WELLKEY
          </span>
        </div>
      </div>

      <Header className="relative z-10">
        <Container>
          <div className="flex min-h-12 items-center justify-end sm:min-h-14">
            <Link
              className="rounded-full border border-black/8 bg-white/70 px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-colors hover:bg-white"
              href="/business/signup"
            >
              Sign up business
            </Link>
          </div>
        </Container>
      </Header>

      <Content className="relative z-10 pb-8" overflow="auto">
        <Container className="h-full">
          <div className="grid gap-12 py-4 md:py-8 lg:min-h-[calc(100dvh-8rem)] lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] lg:items-center lg:gap-16">
            <PublicLandingHero isSettled={isSettled} />

            <section
              className={`space-y-8 transition-all delay-[900ms] duration-[900ms] ease-out ${
                isSettled ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"
              }`}
            >
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/80">
                  Privacy promise
                </p>
                <h2 className="max-w-md text-[clamp(2rem,4vw,3.5rem)] font-[family-name:var(--font-heading)] leading-[0.96]">
                  Made to feel private from the first screen.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {privacyCards.map((card) => (
                  <PrivacyCard key={card.title} {...card} />
                ))}
              </div>
            </section>
          </div>
        </Container>
      </Content>

      <Footer className="relative z-10 pt-0">
        <Container>
          <p className="text-center text-xs tracking-[0.22em] text-muted/80 sm:text-left">
            Anonymous by design.
          </p>
        </Container>
      </Footer>
    </div>
  );
}
