import type { HabitWithProgress } from "@/lib/types";

export function getHabitStreakCopy(habit: HabitWithProgress) {
  if (habit.completedToday && habit.streakCount > 0) {
    return `${habit.streakCount}-day streak`;
  }

  if (habit.streakCount > 0) {
    return `${habit.streakCount}-day streak`;
  }

  return "A gentle place to begin.";
}
