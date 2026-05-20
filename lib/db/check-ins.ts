import { getDb } from "@/lib/db/client";
import { todayIsoDate } from "@/lib/habits/dates";
import type { CheckInFactor, CheckInMode } from "@/lib/types";

type RegularInput = {
  regular_q1_drained: number;
  regular_q3_switch_off_hard: number;
  regular_q5_focus_trouble: number;
  regular_q6_emotional_strain: number;
  regular_q7_recovery_good: number;
  regular_q8_workload_manageable: number;
  regular_q9_supported: number;
  regular_q10_priorities_clear: number;
};

type QuickInput = {
  quick_energy_level: number;
  quick_stress_level: number;
  quick_switch_off_level: number;
  quick_biggest_factor: CheckInFactor;
};

function average(values: number[]) {
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function reverseScore(value: number) {
  return 6 - value;
}

function getRegularScore(input: RegularInput) {
  return average([
    input.regular_q1_drained,
    reverseScore(input.regular_q3_switch_off_hard),
    input.regular_q5_focus_trouble,
    input.regular_q6_emotional_strain,
    reverseScore(input.regular_q7_recovery_good),
    reverseScore(input.regular_q8_workload_manageable),
    reverseScore(input.regular_q9_supported),
    reverseScore(input.regular_q10_priorities_clear)
  ]);
}

function getQuickScore(input: QuickInput) {
  return average([
    reverseScore(input.quick_energy_level),
    input.quick_stress_level,
    reverseScore(input.quick_switch_off_level)
  ]);
}

export async function createQuickCheckIn(userId: string, input: QuickInput) {
  const db = getDb();
  const today = todayIsoDate();
  const quickScore = getQuickScore(input);

  await db`
    insert into daily_check_ins (
      user_id,
      mode,
      completed_on,
      quick_score,
      quick_energy_level,
      quick_stress_level,
      quick_switch_off_level,
      quick_biggest_factor
    )
    values (
      ${userId},
      ${"quick" satisfies CheckInMode},
      ${today}::date,
      ${quickScore},
      ${input.quick_energy_level},
      ${input.quick_stress_level},
      ${input.quick_switch_off_level},
      ${input.quick_biggest_factor}
    )
    on conflict (user_id, completed_on) do nothing
  `;
}

export async function createRegularCheckIn(userId: string, input: RegularInput) {
  const db = getDb();
  const today = todayIsoDate();
  const regularScore = getRegularScore(input);

  await db`
    insert into daily_check_ins (
      user_id,
      mode,
      completed_on,
      regular_score,
      regular_q1_drained,
      regular_q3_switch_off_hard,
      regular_q5_focus_trouble,
      regular_q6_emotional_strain,
      regular_q7_recovery_good,
      regular_q8_workload_manageable,
      regular_q9_supported,
      regular_q10_priorities_clear
    )
    values (
      ${userId},
      ${"regular" satisfies CheckInMode},
      ${today}::date,
      ${regularScore},
      ${input.regular_q1_drained},
      ${input.regular_q3_switch_off_hard},
      ${input.regular_q5_focus_trouble},
      ${input.regular_q6_emotional_strain},
      ${input.regular_q7_recovery_good},
      ${input.regular_q8_workload_manageable},
      ${input.regular_q9_supported},
      ${input.regular_q10_priorities_clear}
    )
    on conflict (user_id, completed_on) do nothing
  `;
}
