import { toIsoDate } from "@/lib/habits/dates";
import type { HabitCompletionRecord, HabitRecord, HabitWithProgress } from "@/lib/types";

function calculateStreakCount(completions: HabitCompletionRecord[], today: string) {
  const completionDates = new Set(completions.map((completion) => completion.completed_on));
  let streak = 0;
  let cursor = new Date(`${today}T00:00:00.000Z`);

  while (completionDates.has(toIsoDate(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export function buildHabitProgress(
  habits: HabitRecord[],
  completions: HabitCompletionRecord[],
  today: string
): HabitWithProgress[] {
  return habits.map((habit) => {
    const habitCompletions = completions.filter((completion) => completion.habit_id === habit.id);

    return {
      ...habit,
      completedToday: habitCompletions.some((completion) => completion.completed_on === today),
      streakCount: calculateStreakCount(habitCompletions, today)
    };
  });
}
