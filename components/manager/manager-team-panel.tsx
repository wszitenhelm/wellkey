"use client";

import { useState, useTransition } from "react";
import { ManagerEmptyState } from "@/components/manager/manager-empty-state";
import { ManagerTeamCard } from "@/components/manager/manager-team-card";
import { ManagerTeamMemberRow } from "@/components/manager/manager-team-member-row";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { SoftCard } from "@/components/ui/soft-card";
import { getCsrfToken } from "@/lib/security/csrf/client";
import type { ActionState, OrganizationTeamsData } from "@/lib/types";
type Props = { data: OrganizationTeamsData };

export function ManagerTeamPanel({ data }: Props) {
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  async function post(body: Record<string, unknown>) {
    const csrfToken = await getCsrfToken();
    const response = await fetch("/api/manager/teams", {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      method: "POST"
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(data.error ?? "Could not update teams.");
  }

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      try {
        setState({});
        await post({ mode: "create", name: String(formData.get("name") ?? "") });
        window.location.reload();
      } catch (error) {
        setState({ error: error instanceof Error ? error.message : "Could not create the team." });
      }
    });
  }

  function assign(memberId: string, teamId: string) {
    startTransition(async () => {
      try {
        setState({});
        await post({ memberId, mode: "assign", teamId: teamId || null });
        window.location.reload();
      } catch (error) {
        setState({ error: error instanceof Error ? error.message : "Could not update team assignment." });
      }
    });
  }

  function removeTeam(teamId: string) {
    startTransition(async () => {
      try {
        setState({});
        await post({ mode: "delete", teamId });
        window.location.reload();
      } catch (error) {
        setState({ error: error instanceof Error ? error.message : "Could not remove the team." });
      }
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <SoftCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Teams</p>
        <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Team structure</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Create light organizational groupings so anonymous aggregate reporting can be read by team when thresholds allow.
        </p>
        <form action={handleCreate} className="mt-6 flex flex-col gap-3 md:flex-row">
          <Input className="flex-1" name="name" placeholder="People Operations" />
          <Button disabled={pending} type="submit">{pending ? "Saving..." : "Add team"}</Button>
        </form>
        <FormMessage state={state} />
        <div className="mt-6 space-y-3">
          {data.teams.length === 0 ? (
            <ManagerEmptyState
              body="Start with one or two broad groups. You can assign anonymous members after they join."
              title="No teams created yet"
            />
          ) : (
            data.teams.map((team) => (
              <ManagerTeamCard key={team.id} onRemove={removeTeam} pending={pending} team={team} />
            ))
          )}
        </div>
      </SoftCard>

      <SoftCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Anonymous members</p>
        <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Team assignment</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          These members stay anonymous. Teams only affect group-level reporting, never individual visibility.
        </p>
        <div className="mt-6 space-y-3">
          {data.members.length === 0 ? (
            <ManagerEmptyState
              body="Anonymous employee members will appear here after they join with a slug link or join code."
              title="No anonymous members yet"
            />
          ) : (
            data.members.map((member) => (
              <ManagerTeamMemberRow key={member.id} member={member} onAssign={assign} teams={data.teams} />
            ))
          )}
        </div>
      </SoftCard>
    </div>
  );
}
