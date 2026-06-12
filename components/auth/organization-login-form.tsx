"use client";
import { useState, useTransition } from "react";
import { AuthField } from "@/components/auth/auth-field";
import { AuthLinkPrompt } from "@/components/auth/auth-link-prompt";
import { organizationLoginWithApi } from "@/lib/auth/organization-api";
import type { ActionState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

export function OrganizationLoginForm() {
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setState({});
        await organizationLoginWithApi({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? "")
        });
        window.location.href = "/manager";
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
      <AuthField
        autoCapitalize="none"
        label="Work email"
        name="email"
        placeholder="team@company.com"
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
        href="/business/signup"
        label="Create one"
        prefix="Need a business account?"
      />
    </form>
  );
}
