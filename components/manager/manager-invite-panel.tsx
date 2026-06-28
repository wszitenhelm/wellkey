"use client";

import { useState, useTransition } from "react";
import {
  createOrganizationInviteWithApi,
  revokeOrganizationInviteWithApi
} from "@/lib/auth/organization-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ManagerEmptyState } from "@/components/manager/manager-empty-state";
import type { OrganizationInviteRecord } from "@/lib/types";

type Props = {
  invites: OrganizationInviteRecord[];
};

export function ManagerInvitePanel({ invites }: Props) {
  const [email, setEmail] = useState("");
  const [createdInvite, setCreatedInvite] = useState<null | { email: string; invitePath: string }>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function createInvite() {
    startTransition(async () => {
      try {
        setError("");
        const result = await createOrganizationInviteWithApi({ email });
        setCreatedInvite({
          email: result.email,
          invitePath: `${window.location.origin}${result.invitePath}`
        });
        setEmail("");
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "We could not create that invite.");
      }
    });
  }

  function revoke(inviteId: string) {
    startTransition(async () => {
      try {
        setError("");
        await revokeOrganizationInviteWithApi({ inviteId });
        window.location.reload();
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "We could not revoke that invite.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
        <Input
          onChange={(event) => setEmail(event.target.value)}
          placeholder="team@company.com"
          type="email"
          value={email}
        />
        <Button disabled={pending || !email.trim()} onClick={createInvite} type="button">
          {pending ? "Saving..." : "Create invite"}
        </Button>
      </div>
      {createdInvite ? (
        <div className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4 text-sm">
          <p className="font-medium">Invite ready for {createdInvite.email}</p>
          <p className="mt-2 break-all text-muted">{createdInvite.invitePath}</p>
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="space-y-3">
        {invites.length === 0 ? (
          <ManagerEmptyState
            body="Create a workspace invite when you want another manager, HR lead, or admin to join."
            title="No active invites"
          />
        ) : (
          invites.map((invite) => (
            <div key={invite.id} className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
              <p className="font-medium">{invite.email ?? "Invite link"}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                Expires {invite.expires_at}
              </p>
              <Button className="mt-3" disabled={pending} onClick={() => revoke(invite.id)} type="button" variant="ghost">
                Revoke
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
