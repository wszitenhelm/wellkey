"use client";

import Link from "next/link";
import type { ReminderNoteRecord } from "@/lib/types";
import { getDailyFocus, getPersonalMessage } from "@/lib/content/experience";
import { LiveReminderNoteList } from "@/components/dashboard/live-reminder-note-list";
import { ReminderNoteForm } from "@/components/dashboard/reminder-note-form";
import { InsightCard } from "@/components/dashboard/insight-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SoftCard } from "@/components/ui/soft-card";

type DashboardHomeProps = {
  notes: ReminderNoteRecord[];
  userId: string;
};

const meditationDraft =
  "Guide me through a short personalized meditation for how work feels today.";

export function DashboardHome({ notes, userId }: DashboardHomeProps) {
  const focus = getDailyFocus();

  return (
    <div className="space-y-4 pb-2">
      <SoftCard className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {focus.title}
          </p>
          <p className="text-lg leading-7 text-foreground">{focus.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <PrimaryButton
            className="w-full px-4 text-sm sm:px-3 sm:text-xs"
            onClick={() => window.dispatchEvent(new CustomEvent("quietly:open-check-in"))}
            type="button"
          >
            Check in
          </PrimaryButton>
          <SecondaryButton asChild className="w-full px-4 text-sm sm:px-3 sm:text-xs">
            <Link href="/chat">Talk</Link>
          </SecondaryButton>
          <SecondaryButton asChild className="w-full px-4 text-sm sm:px-3 sm:text-xs">
            <Link href="/habits">Take a reset</Link>
          </SecondaryButton>
          <SecondaryButton asChild className="w-full px-4 text-sm sm:px-3 sm:text-xs">
            <Link href={`/chat?draft=${encodeURIComponent(meditationDraft)}`}>
              Personalized guided meditation
            </Link>
          </SecondaryButton>
        </div>
      </SoftCard>

      <InsightCard
        body={getPersonalMessage()}
        title="Especially for you"
      />

      <SoftCard className="space-y-4 p-5">
        <div>
          <h2 className="font-serif text-2xl leading-tight">Reminder notes</h2>
          <p className="mt-1 text-sm text-muted">A small wall of good things to come back to.</p>
        </div>
        <ReminderNoteForm />
      </SoftCard>

      <LiveReminderNoteList initialNotes={notes} userId={userId} />
    </div>
  );
}
