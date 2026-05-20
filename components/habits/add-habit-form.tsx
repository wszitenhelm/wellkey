"use client";

import { useActionState } from "react";
import { createHabitAction } from "@/lib/actions/habit-actions";
import type { ActionState } from "@/lib/types";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/ui/primary-button";

const initialState: ActionState = {};

export function AddHabitForm() {
  const [state, formAction, pending] = useActionState(createHabitAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <label className="block space-y-2">
        <span className="text-sm font-medium">Add your own small step</span>
        <Input name="title" placeholder="Leave Slack closed during dinner" />
      </label>
      <FormMessage state={state} />
      <PrimaryButton className="w-full" disabled={pending} type="submit">
        {pending ? "Adding..." : "Add habit"}
      </PrimaryButton>
    </form>
  );
}
