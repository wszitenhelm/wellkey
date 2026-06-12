"use client";
import { useState, useTransition } from "react";
import { AuthField } from "@/components/auth/auth-field";
import { AuthLinkPrompt } from "@/components/auth/auth-link-prompt";
import { organizationSignupWithApi } from "@/lib/auth/organization-api";
import type { ActionState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

export function OrganizationSignupForm() {
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setState({});
        await organizationSignupWithApi({
          companyName: String(formData.get("companyName") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? "")
        });
        window.location.href = "/manager";
      } catch (error) {
        setState({
          error:
            error instanceof Error
              ? error.message
              : "We could not create your business account. Please try again."
        });
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <AuthField label="Company name" name="companyName" placeholder="Wellkey Labs" />
      <AuthField
        autoCapitalize="none"
        label="Work email"
        name="email"
        placeholder="team@company.com"
      />
      <AuthField
        label="Create a password"
        name="password"
        placeholder="At least 10 characters"
        type="password"
      />

      <FormMessage state={state} />

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Creating..." : "Create business account"}
      </Button>

      <AuthLinkPrompt
        href="/business/login"
        label="Log in"
        prefix="Already have a business account?"
      />
    </form>
  );
}
