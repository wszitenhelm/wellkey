import { todayIsoDate } from "@/lib/habits/dates";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
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
  const supabase = getSupabaseAdmin();
  const today = todayIsoDate();
  const quickScore = getQuickScore(input);

  unwrapSupabaseData(
    await supabase
      .from("daily_check_ins")
      .upsert(
        {
          completed_on: today,
          mode: "quick" satisfies CheckInMode,
          quick_biggest_factor: input.quick_biggest_factor,
          quick_energy_level: input.quick_energy_level,
          quick_score: quickScore,
          quick_stress_level: input.quick_stress_level,
          quick_switch_off_level: input.quick_switch_off_level,
          user_id: userId
        },
        { ignoreDuplicates: true, onConflict: "user_id,completed_on" }
      )
  );
}

export async function createRegularCheckIn(userId: string, input: RegularInput) {
  const supabase = getSupabaseAdmin();
  const today = todayIsoDate();
  const regularScore = getRegularScore(input);

  unwrapSupabaseData(
    await supabase
      .from("daily_check_ins")
      .upsert(
        {
          completed_on: today,
          mode: "regular" satisfies CheckInMode,
          regular_q10_priorities_clear: input.regular_q10_priorities_clear,
          regular_q1_drained: input.regular_q1_drained,
          regular_q3_switch_off_hard: input.regular_q3_switch_off_hard,
          regular_q5_focus_trouble: input.regular_q5_focus_trouble,
          regular_q6_emotional_strain: input.regular_q6_emotional_strain,
          regular_q7_recovery_good: input.regular_q7_recovery_good,
          regular_q8_workload_manageable: input.regular_q8_workload_manageable,
          regular_q9_supported: input.regular_q9_supported,
          regular_score: regularScore,
          user_id: userId
        },
        { ignoreDuplicates: true, onConflict: "user_id,completed_on" }
      )
  );
}
