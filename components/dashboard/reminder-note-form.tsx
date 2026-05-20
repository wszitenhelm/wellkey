"use client";

import { useActionState } from "react";
import { createReminderNoteAction } from "@/lib/actions/reminder-note-actions";
import type { ActionState } from "@/lib/types";
import { reminderNoteCategories } from "@/lib/content/experience";
import { FormMessage } from "@/components/ui/form-message";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = {};

export function ReminderNoteForm() {
  const [state, formAction, pending] = useActionState(
    createReminderNoteAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {reminderNoteCategories.map((category, index) => (
          <label
            key={category.value}
            className="flex cursor-pointer items-center gap-2 rounded-[1.35rem] border border-border/70 bg-white/75 px-4 py-3"
          >
            <input
              className="accent-teal-700"
              defaultChecked={index === 0}
              name="kind"
              type="radio"
              value={category.value}
            />
            <span className="text-sm leading-5 text-foreground">{category.label}</span>
          </label>
        ))}
      </div>
      <Textarea
        maxLength={180}
        name="content"
        className="min-h-28 bg-white/80"
        placeholder="I handled a hard conversation with more calm than I expected."
      />
      <FormMessage state={state} />
      <PrimaryButton className="w-full" disabled={pending} type="submit">
        {pending ? "Saving..." : "Save reminder"}
      </PrimaryButton>
    </form>
  );
}
