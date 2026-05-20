"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCheckInAction } from "@/lib/actions/check-in-actions";
import type { CheckInActionState, CheckInMode } from "@/lib/types";
import { FormMessage } from "@/components/ui/form-message";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SoftCard } from "@/components/ui/soft-card";
import { QuickCheckInForm } from "@/components/checkins/quick-check-in-form";
import { RegularCheckInForm } from "@/components/checkins/regular-check-in-form";
import { CheckInSubmitButton } from "@/components/checkins/check-in-submit-button";

type CheckInGateProps = {
  currentPath: string;
  onClose?: () => void;
  onComplete: (nextStep: string) => void;
};

const initialState: CheckInActionState = {};

export function CheckInGate({
  currentPath,
  onClose,
  onComplete
}: CheckInGateProps) {
  const router = useRouter();
  const [mode, setMode] = useState<CheckInMode>("quick");
  const [state, formAction] = useActionState(createCheckInAction, initialState);

  useEffect(() => {
    if (state.submitted && state.nextStep) {
      onComplete(state.nextStep);
      router.refresh();
    }
  }, [onComplete, router, state.nextStep, state.submitted]);

  return (
    <div className="fixed inset-0 z-40 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-md items-end px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.9rem)] pt-[calc(env(safe-area-inset-top,0px)+1rem)] sm:px-5 sm:pb-14 sm:pt-16">
        <SoftCard className="flex max-h-[calc(100dvh-2.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] w-full flex-col gap-5 overflow-hidden p-4 animate-fade-in sm:gap-6 sm:p-5">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                How are you feeling today?
              </p>
              <h2 className="font-serif text-[1.9rem] leading-tight sm:text-3xl">
                Let's understand how today feels.
              </h2>
              <p className="text-sm text-muted">
                Quick is lighter. Regular gives a fuller picture.
              </p>
            </div>
            <SecondaryButton
              className="h-10 px-4 text-sm"
              onClick={onClose}
              type="button"
            >
              Maybe later
            </SecondaryButton>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-full bg-foreground/5 p-1">
            <SecondaryButton
              className={
                mode === "quick"
                  ? "border-accent bg-accent text-accentForeground shadow-none"
                  : "bg-transparent text-foreground hover:bg-white"
              }
              onClick={() => setMode("quick")}
              type="button"
            >
              Quick
            </SecondaryButton>
            <SecondaryButton
              className={
                mode === "regular"
                  ? "border-accent bg-accent text-accentForeground shadow-none"
                  : "bg-transparent text-foreground hover:bg-white"
              }
              onClick={() => setMode("regular")}
              type="button"
            >
              Regular
            </SecondaryButton>
          </div>

          <form action={formAction} className="flex min-h-0 flex-1 flex-col gap-6" key={mode}>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {mode === "quick" ? <QuickCheckInForm currentPath={currentPath} /> : <RegularCheckInForm currentPath={currentPath} />}
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <FormMessage state={state} />
              <CheckInSubmitButton>Done in under a minute</CheckInSubmitButton>
            </div>
          </form>
        </SoftCard>
      </div>
    </div>
  );
}
