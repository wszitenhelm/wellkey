"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/guards";
import { habitSchema } from "@/lib/auth/validators";
import {
  archiveHabit,
  completeHabitForToday,
  createHabit,
  reorderHabits
} from "@/lib/db/habits";
import type { ActionState } from "@/lib/types";

export async function createHabitAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = habitSchema.safeParse({
    title: formData.get("title")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  try {
    await createHabit(session.userId, parsed.data.title);
    revalidatePath("/habits");
    return {};
  } catch {
    return { error: "We could not add that habit. Please try again." };
  }
}

export async function completeHabitAction(formData: FormData) {
  const session = await requireSession();
  const habitId = formData.get("habitId");

  if (typeof habitId !== "string" || habitId.length === 0) {
    return;
  }

  await completeHabitForToday(session.userId, habitId);
  revalidatePath("/habits");
}

export async function deleteHabitAction(formData: FormData) {
  const session = await requireSession();
  const habitId = formData.get("habitId");

  if (typeof habitId !== "string" || habitId.length === 0) {
    return;
  }

  await archiveHabit(session.userId, habitId);
  revalidatePath("/habits");
}

export async function reorderHabitsAction(orderedHabitIds: string[]) {
  const session = await requireSession();

  if (orderedHabitIds.length === 0) {
    return;
  }

  await reorderHabits(session.userId, orderedHabitIds);
  revalidatePath("/habits");
}
