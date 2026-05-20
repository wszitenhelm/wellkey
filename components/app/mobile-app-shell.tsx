"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppTopBar } from "@/components/app/app-top-bar";
import { DailyLanding } from "@/components/app/daily-landing";
import { BottomNav } from "@/components/app/bottom-tab-nav";
import { CheckInCompletion } from "@/components/checkins/check-in-completion";
import { CheckInGate } from "@/components/checkins/check-in-gate";
import { PageShell } from "@/components/layout/page-shell";

type MobileAppShellProps = {
  currentPath: string;
  children: ReactNode;
};

function todayKey() {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

export function MobileAppShell({
  currentPath,
  children
}: MobileAppShellProps) {
  const [completionStep, setCompletionStep] = useState("");
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [isLandingOpen, setIsLandingOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  useEffect(() => {
    const handleOpenCheckIn = () => setIsCheckInOpen(true);
    window.addEventListener("quietly:open-check-in", handleOpenCheckIn);

    return () => window.removeEventListener("quietly:open-check-in", handleOpenCheckIn);
  }, []);

  useEffect(() => {
    const storageKey = `landing-seen:${todayKey()}`;
    if (window.localStorage.getItem(storageKey)) {
      return;
    }

    window.localStorage.setItem(storageKey, "true");
    setIsLandingOpen(true);
  }, []);

  return (
    <PageShell className="min-h-screen gap-6 px-5 py-6">
      <AppTopBar onOpenCheckIn={() => setIsCheckInOpen(true)} />
      <div className="flex min-h-0 flex-1 flex-col gap-6">{children}</div>
      <BottomNav currentPath={currentPath} />
      {isLandingOpen ? (
        <DailyLanding
          onSkip={() => setIsLandingOpen(false)}
          onStartCheckIn={() => {
            setIsLandingOpen(false);
            setIsCheckInOpen(true);
          }}
        />
      ) : null}
      {isCheckInOpen ? (
        <CheckInGate
          currentPath={currentPath}
          onClose={() => setIsCheckInOpen(false)}
          onComplete={(nextStep) => {
            setIsCheckInOpen(false);
            setCompletionStep(nextStep);
            setIsCompletionOpen(true);
          }}
        />
      ) : null}
      {isCompletionOpen ? (
        <CheckInCompletion nextStep={completionStep} onClose={() => setIsCompletionOpen(false)} />
      ) : null}
    </PageShell>
  );
}
