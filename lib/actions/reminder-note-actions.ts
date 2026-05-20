"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/guards";
import { reminderNoteSchema } from "@/lib/auth/validators";
import { createReminderNote } from "@/lib/db/reminder-notes";
import type { ActionState } from "@/lib/types";

export async function createReminderNoteAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = reminderNoteSchema.safeParse({
    kind: formData.get("kind"),
    content: formData.get("content")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  try {
    await createReminderNote({
      userId: session.userId,
      kind: parsed.data.kind,
      content: parsed.data.content
    });
    revalidatePath("/dashboard");
    return {};
  } catch {
    return { error: "We could not save that reminder note. Please try again." };
  }
}
