"use client";

import { useState, useTransition } from "react";
import { loginWithApi } from "@/lib/auth/api";
import type { ActionState } from "@/lib/types";
import { AuthField } from "@/components/auth/auth-field";
import { AuthLinkPrompt } from "@/components/auth/auth-link-prompt";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

type LoginFormProps = {
  organizationName?: string;
  organizationSlug?: string;
  showOrganizationCode?: boolean;
};

export function LoginForm({
  organizationName,
  organizationSlug,
  showOrganizationCode = true
}: LoginFormProps) {
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setState({});
        await loginWithApi({
          loginCode: String(formData.get("loginCode") ?? ""),
          organizationCode: String(formData.get("organizationCode") ?? ""),
          organizationSlug,
          password: String(formData.get("password") ?? "")
        });
        window.location.href = "/dashboard";
      } catch (error) {
        setState({
          error:
            error instanceof Error ? error.message : "We could not log you in. Please try again."
        });
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {organizationName ? (
        <div className="rounded-[1.5rem] bg-accent/8 p-4 text-sm text-foreground">
          Logging in anonymously under <span className="font-semibold">{organizationName}</span>.
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

      <AuthLinkPrompt
        href={organizationSlug ? `/${organizationSlug}/sign-up` : "/signup"}
        label="Create one"
        prefix="Need a new private account?"
      />
    </form>
  );
}
