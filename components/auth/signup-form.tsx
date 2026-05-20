"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/actions/auth-actions";
import { AuthField } from "@/components/auth/auth-field";
import { AuthLinkPrompt } from "@/components/auth/auth-link-prompt";
import type { SignupActionState } from "@/lib/types";
import { CredentialsPanel } from "@/components/auth/credentials-panel";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import Link from "next/link";

const initialState: SignupActionState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  if (state.credentials) {
    return (
      <div className="space-y-4">
        <CredentialsPanel
          loginCode={state.credentials.loginCode}
          recoveryCode={state.credentials.recoveryCode}
        />
        <Button asChild className="w-full">
          <Link href="/dashboard">Continue to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <AuthField
        autoCapitalize="none"
        label="Create a login code"
        name="loginCode"
        placeholder="quiet-river-4821"
      />
      <AuthField
        label="Create a password"
        name="password"
        placeholder="At least 10 characters"
        type="password"
      />

      <FormMessage state={state} />

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Creating..." : "Create an account"}
      </Button>

      <AuthLinkPrompt href="/login" label="Log in" prefix="Already have a login code?" />
    </form>
  );
}
