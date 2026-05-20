"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth-actions";
import type { ActionState } from "@/lib/types";
import { AuthField } from "@/components/auth/auth-field";
import { AuthLinkPrompt } from "@/components/auth/auth-link-prompt";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <AuthField
        autoCapitalize="none"
        label="Login code"
        name="loginCode"
        placeholder="quiet-river-4821"
      />
      <AuthField
        label="Password"
        name="password"
        placeholder="Enter your password"
        type="password"
      />

      <FormMessage state={state} />

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Unlocking..." : "Log in"}
      </Button>

      <AuthLinkPrompt href="/signup" label="Create one" prefix="Need a new private account?" />
    </form>
  );
}
