"use client";

import { getHabitStreakCopy } from "@/lib/habits/copy";
import type { HabitReflection, HabitWithProgress } from "@/lib/types";
import { habitReflectionOptions } from "@/lib/content/experience";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SoftCard } from "@/components/ui/soft-card";

type HabitCardProps = {
  editing?: boolean;
  habit: HabitWithProgress;
  reflection?: HabitReflection;
  recommended?: boolean;
  onComplete: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onReflect: (habitId: string, value: HabitReflection) => void;
};

export function HabitCard({
  editing = false,
  habit,
  reflection,
  recommended = false,
  onComplete,
  onDelete,
  onReflect
}: HabitCardProps) {
  return (
    <SoftCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {recommended ? (
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Recommended today
              </span>
            ) : null}
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {getHabitStreakCopy(habit)}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{habit.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{habit.description}</p>
          </div>
        </div>

        {editing ? (
          <div className="flex flex-col items-end gap-2">
            <SecondaryButton className="h-10 px-4 text-xs" onClick={() => onDelete(habit.id)} type="button">
              Delete
            </SecondaryButton>
            <button
              className="cursor-grab rounded-full border border-border/80 bg-white/80 px-4 py-2 text-xs font-semibold text-muted active:cursor-grabbing"
              type="button"
            >
              Drag
            </button>
          </div>
        ) : (
          <button
            aria-label={habit.completedToday ? "Completed today" : "Mark done for today"}
            className={`flex h-12 min-w-12 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${
              habit.completedToday
                ? "border-accent bg-accent text-accentForeground shadow-soft"
                : "border-border/80 bg-white/80 text-foreground hover:border-accent"
            }`}
            disabled={habit.completedToday}
            onClick={() => onComplete(habit.id)}
            type="button"
          >
            {habit.completedToday ? "Done" : "Check"}
          </button>
        )}
      </div>

      {habit.completedToday ? (
        <div className="mt-4 rounded-[1.5rem] bg-foreground/5 p-4">
          <p className="text-sm font-medium text-foreground">Did this help?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {habitReflectionOptions.map((option) => (
              <button
                key={option.value}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  reflection === option.value
                    ? "bg-accent text-accentForeground"
                    : "bg-white/80 text-muted"
                }`}
                onClick={() => onReflect(habit.id, option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </SoftCard>
  );
}
