"use client";

import Link from "next/link";
import type { HabitWithProgress, ReminderNoteRecord } from "@/lib/types";
import { getDailyFocus, getMockInsight } from "@/lib/content/experience";
import { ReminderNoteForm } from "@/components/dashboard/reminder-note-form";
import { ReminderNoteList } from "@/components/dashboard/reminder-note-list";
import { InsightCard } from "@/components/dashboard/insight-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SoftCard } from "@/components/ui/soft-card";

type DashboardHomeProps = {
  habits: HabitWithProgress[];
  notes: ReminderNoteRecord[];
};

export function DashboardHome({ habits, notes }: DashboardHomeProps) {
  const focus = getDailyFocus();
  const previewHabits = habits.slice(0, 2);

  return (
    <div className="space-y-4">
      <SoftCard className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {focus.title}
          </p>
          <p className="text-lg leading-8 text-foreground">{focus.subtitle}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <PrimaryButton
            className="w-full px-3 text-xs"
            onClick={() => window.dispatchEvent(new CustomEvent("quietly:open-check-in"))}
            type="button"
          >
            Check in
          </PrimaryButton>
          <SecondaryButton asChild className="w-full px-3 text-xs">
            <Link href="/chat">Talk</Link>
          </SecondaryButton>
          <SecondaryButton asChild className="w-full px-3 text-xs">
            <Link href="/habits">Take a reset</Link>
          </SecondaryButton>
        </div>
      </SoftCard>

      <InsightCard body={getMockInsight()} title="A pattern to notice" />

      <SoftCard className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Small steps for today
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              These are gentle habits. Choose what feels possible.
            </p>
          </div>
          <Link className="text-sm font-semibold text-accent" href="/habits">
            See all
          </Link>
        </div>
        <div className="space-y-3">
          {previewHabits.map((habit) => (
            <div key={habit.id} className="rounded-[1.65rem] bg-white/70 p-4">
              <p className="font-semibold text-foreground">{habit.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{habit.description}</p>
            </div>
          ))}
        </div>
      </SoftCard>

      <SoftCard className="space-y-4 p-5">
        <div>
          <h2 className="font-serif text-2xl leading-tight">Reminder notes</h2>
          <p className="mt-1 text-sm text-muted">A small wall of good things to come back to.</p>
        </div>
        <ReminderNoteForm />
      </SoftCard>

      <ReminderNoteList notes={notes} />
    </div>
  );
}
