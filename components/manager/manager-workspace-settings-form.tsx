"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { getCsrfToken } from "@/lib/security/csrf/client";
import type { ActionState, OrganizationWorkspaceData } from "@/lib/types";

type Props = {
  workspace: OrganizationWorkspaceData;
};

export function ManagerWorkspaceSettingsForm({ workspace }: Props) {
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setState({});
        const csrfToken = await getCsrfToken();
        const response = await fetch("/api/manager/workspace", {
          body: JSON.stringify({
            allowDomainJoin: formData.get("allowDomainJoin") === "on",
            allowInviteJoin: formData.get("allowInviteJoin") === "on",
            minimumReportingThreshold: Number(formData.get("minimumReportingThreshold") ?? 5),
            showExportButton: formData.get("showExportButton") === "on",
            showTeamBreakdowns: formData.get("showTeamBreakdowns") === "on"
          }),
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
          method: "POST"
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not save workspace controls.");
        window.location.reload();
      } catch (error) {
        setState({ error: error instanceof Error ? error.message : "Could not save workspace controls." });
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        defaultValue={String(workspace.settings.minimum_reporting_threshold)}
        min={3}
        name="minimumReportingThreshold"
        type="number"
      />
      <label className="flex items-center gap-3 rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
        <input defaultChecked={workspace.settings.allow_domain_join} name="allowDomainJoin" type="checkbox" />
        <span className="text-sm">Allow employees to join directly through a verified company link.</span>
      </label>
      <label className="flex items-center gap-3 rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
        <input defaultChecked={workspace.settings.allow_invite_join} name="allowInviteJoin" type="checkbox" />
        <span className="text-sm">Allow join-code onboarding for anonymous employee accounts.</span>
      </label>
      <label className="flex items-center gap-3 rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
        <input defaultChecked={workspace.settings.show_team_breakdowns} name="showTeamBreakdowns" type="checkbox" />
        <span className="text-sm">Allow team-level aggregate breakdowns when thresholds are met.</span>
      </label>
      <label className="flex items-center gap-3 rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
        <input defaultChecked={workspace.settings.show_export_button} name="showExportButton" type="checkbox" />
        <span className="text-sm">Keep one-click export available for reporting viewers.</span>
      </label>
      <FormMessage state={state} />
      <Button disabled={pending} type="submit">
        {pending ? "Saving..." : "Save workspace controls"}
      </Button>
    </form>
  );
}
