"use client";

import { useState, useTransition } from "react";
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
        <form action={handleCreate} className="mt-6 flex flex-col gap-3 md:flex-row">
          <Input className="flex-1" name="name" placeholder="People Operations" />
          <Button disabled={pending} type="submit">{pending ? "Saving..." : "Add team"}</Button>
        </form>
        <FormMessage state={state} />
        <div className="mt-6 space-y-3">
          {data.teams.map((team) => (
            <div key={team.id} className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="mt-1 text-sm text-muted">{team.slug}</p>
                </div>
                <Button disabled={pending} onClick={() => removeTeam(team.id)} type="button" variant="ghost">
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SoftCard>

      <SoftCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Anonymous members</p>
        <h2 className="mt-3 font-serif text-3xl leading-[0.96]">Team assignment</h2>
        <div className="mt-6 space-y-3">
          {data.members.map((member) => (
            <div key={member.id} className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-white/70 p-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
              <div>
                <p className="font-medium">{member.org_scoped_employee_id}</p>
                <p className="mt-1 text-sm text-muted">Joined by {member.join_method}</p>
              </div>
              <select
                className="h-12 rounded-2xl border border-border bg-white px-4 text-sm"
                defaultValue={member.teamIds[0] ?? ""}
                onChange={(event) => assign(member.id, event.target.value)}
              >
                <option value="">No team</option>
                {data.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </SoftCard>
    </div>
  );
}
