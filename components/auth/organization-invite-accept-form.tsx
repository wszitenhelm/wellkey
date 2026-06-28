"use client";

import { useState, useTransition } from "react";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { acceptOrganizationInviteWithApi } from "@/lib/auth/organization-api";
import type { ActionState } from "@/lib/types";

type Props = {
  organizationName: string;
  token: string;
  workEmail: string | null;
};

export function OrganizationInviteAcceptForm({ organizationName, token, workEmail }: Props) {
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setState({});
        await acceptOrganizationInviteWithApi({
          fullName: String(formData.get("fullName") ?? ""),
          password: String(formData.get("password") ?? ""),
          token
        });
        window.location.href = "/manager";
      } catch (error) {
        setState({
          error:
            error instanceof Error ? error.message : "We could not accept that invite. Please try again."
        });
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="rounded-[1.5rem] bg-accent/8 p-4 text-sm text-foreground">
        Joining <span className="font-semibold">{organizationName}</span>
        {workEmail ? <> with <span className="font-semibold">{workEmail}</span>.</> : "."}
      </div>
      <AuthField label="Full name" name="fullName" placeholder="Alex Morgan" />
      <AuthField
        label="Create a password"
        name="password"
        placeholder="At least 10 characters"
        type="password"
      />
      <FormMessage state={state} />
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Joining..." : "Join workspace"}
      </Button>
    </form>
  );
}
