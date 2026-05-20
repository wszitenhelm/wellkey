"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/guards";
import { quickCheckInSchema, regularCheckInSchema } from "@/lib/auth/validators";
import { getCompletionStep } from "@/lib/content/experience";
import { createQuickCheckIn, createRegularCheckIn } from "@/lib/db/check-ins";
import type { CheckInActionState } from "@/lib/types";

export async function createCheckInAction(
  _previousState: CheckInActionState,
  formData: FormData
): Promise<CheckInActionState> {
  const session = await requireSession();
  const mode = formData.get("mode");
  const currentPath = formData.get("currentPath");

  if (typeof currentPath !== "string" || currentPath.length === 0) {
    return { error: "We could not save your check-in. Please try again." };
  }

  try {
    let nextStep = getCompletionStep();

    if (mode === "quick") {
      const parsed = quickCheckInSchema.safeParse({
        quick_energy_level: formData.get("quick_energy_level"),
        quick_stress_level: formData.get("quick_stress_level"),
        quick_switch_off_level: formData.get("quick_switch_off_level"),
        quick_biggest_factor: formData.get("quick_biggest_factor")
      });

      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message };
      }

      await createQuickCheckIn(session.userId, parsed.data);
      nextStep = getCompletionStep(parsed.data.quick_biggest_factor);
    } else if (mode === "regular") {
      const parsed = regularCheckInSchema.safeParse({
        regular_q1_drained: formData.get("regular_q1_drained"),
        regular_q3_switch_off_hard: formData.get("regular_q3_switch_off_hard"),
        regular_q5_focus_trouble: formData.get("regular_q5_focus_trouble"),
        regular_q6_emotional_strain: formData.get("regular_q6_emotional_strain"),
        regular_q7_recovery_good: formData.get("regular_q7_recovery_good"),
        regular_q8_workload_manageable: formData.get("regular_q8_workload_manageable"),
        regular_q9_supported: formData.get("regular_q9_supported"),
        regular_q10_priorities_clear: formData.get("regular_q10_priorities_clear")
      });

      if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message };
      }

      await createRegularCheckIn(session.userId, parsed.data);
    } else {
      return { error: "Choose quick or regular first." };
    }

    revalidatePath(currentPath);
    return { nextStep, submitted: true };
  } catch {
    return { error: "We could not save your check-in. Please try again." };
  }
}
