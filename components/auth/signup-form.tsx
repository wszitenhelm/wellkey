"use client";

import { useState, useTransition } from "react";
import { signupWithApi } from "@/lib/auth/api";
import { AuthField } from "@/components/auth/auth-field";
import { AuthLinkPrompt } from "@/components/auth/auth-link-prompt";
import type { SignupActionState } from "@/lib/types";
import { CredentialsPanel } from "@/components/auth/credentials-panel";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import Link from "next/link";

type SignupFormProps = {
  organizationName?: string;
  organizationSlug?: string;
  showOrganizationCode?: boolean;
};

export function SignupForm({
  organizationName,
  organizationSlug,
  showOrganizationCode = true
}: SignupFormProps) {
  const [state, setState] = useState<SignupActionState>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setState({});
        const response = await signupWithApi({
          loginCode: String(formData.get("loginCode") ?? ""),
          organizationCode: String(formData.get("organizationCode") ?? ""),
          organizationSlug,
          password: String(formData.get("password") ?? "")
        });
        setState({ credentials: response.credentials });
      } catch (error) {
        setState({
          error:
            error instanceof Error
              ? error.message
              : "We could not create your account. Please try again."
        });
      }
    });
  }

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
    <form action={handleSubmit} className="space-y-4">
      {organizationName ? (
        <div className="rounded-[1.5rem] bg-accent/8 p-4 text-sm text-foreground">
          Joining anonymously under <span className="font-semibold">{organizationName}</span>.
        </div>
      ) : null}
      {showOrganizationCode ? (
        <AuthField
          autoCapitalize="characters"
          label="Organization code"
          name="organizationCode"
          placeholder="AB12CD34"
        />
      ) : null}
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

      <AuthLinkPrompt
        href={organizationSlug ? `/${organizationSlug}/login` : "/login"}
        label="Log in"
        prefix="Already have a login code?"
      />
    </form>
  );
}
