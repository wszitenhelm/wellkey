"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { getCsrfToken } from "@/lib/security/csrf/client";
import type { ActionState, OrganizationWorkspaceData } from "@/lib/types";

type Props = {
  workspace: OrganizationWorkspaceData;
};

export function ManagerSettingsForm({ workspace }: Props) {
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();
  const organization = workspace.organization;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setState({});
        const csrfToken = await getCsrfToken();
        const response = await fetch("/api/manager/settings", {
          body: JSON.stringify(Object.fromEntries(formData.entries())),
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
          method: "POST"
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not save settings.");
        window.location.reload();
      } catch (error) {
        setState({ error: error instanceof Error ? error.message : "Could not save settings." });
      }
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <Input defaultValue={organization.legal_name} name="legalName" placeholder="Legal name" />
      <Input defaultValue={organization.display_name} name="displayName" placeholder="Display name" />
      <Input defaultValue={organization.logo_url ?? ""} name="logoUrl" placeholder="Logo URL" />
      <Input defaultValue={organization.website_url ?? ""} name="websiteUrl" placeholder="Website URL" />
      <Input defaultValue={organization.address_line_1 ?? ""} name="addressLine1" placeholder="Address line 1" />
      <Input defaultValue={organization.address_line_2 ?? ""} name="addressLine2" placeholder="Address line 2" />
      <Input defaultValue={organization.city ?? ""} name="city" placeholder="City" />
      <Input defaultValue={organization.postal_code ?? ""} name="postalCode" placeholder="Postal code" />
      <Input defaultValue={organization.country ?? ""} name="country" placeholder="Country" />
      <Input
        className="md:col-span-2"
        defaultValue={organization.billing_address?.text ?? ""}
        name="billingAddress"
        placeholder="Billing address"
      />
      <div className="md:col-span-2">
        <FormMessage state={state} />
      </div>
      <div className="md:col-span-2">
        <Button disabled={pending} type="submit">
          {pending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
