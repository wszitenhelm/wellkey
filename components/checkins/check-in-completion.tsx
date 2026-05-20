"use client";

import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SoftCard } from "@/components/ui/soft-card";

type CheckInCompletionProps = {
  nextStep: string;
  onClose: () => void;
};

export function CheckInCompletion({ nextStep, onClose }: CheckInCompletionProps) {
  return (
    <div className="fixed inset-0 z-40 bg-background/90 backdrop-blur-sm animate-fade-in">
      <div className="mx-auto flex h-full w-full max-w-md items-end px-5 pb-14 pt-16">
        <SoftCard className="w-full space-y-5 p-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Thank you for checking in.
            </p>
            <h2 className="font-serif text-3xl leading-tight">
              That gives you a little more clarity about today.
            </h2>
          </div>

          <div className="rounded-[1.75rem] bg-accent/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Recommended next step
            </p>
            <p className="mt-2 text-base leading-7 text-foreground">{nextStep}</p>
          </div>

          <div className="space-y-3">
            <PrimaryButton className="w-full" onClick={onClose} type="button">
              Start now
            </PrimaryButton>
            <SecondaryButton className="w-full" onClick={onClose} type="button">
              Maybe later
            </SecondaryButton>
          </div>
        </SoftCard>
      </div>
    </div>
  );
}
