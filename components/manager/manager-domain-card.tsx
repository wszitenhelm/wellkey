"use client";

import { useState, useTransition } from "react";
import { ManagerDomainItem } from "@/components/manager/manager-domain-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { getCsrfToken } from "@/lib/security/csrf/client";
import type { ActionState, OrganizationDomainRecord } from "@/lib/types";

type Props = {
  domains: OrganizationDomainRecord[];
};

export function ManagerDomainCard({ domains }: Props) {
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setState({});
        const csrfToken = await getCsrfToken();
        const response = await fetch("/api/manager/domains", {
          body: JSON.stringify({ domain: String(formData.get("domain") ?? "") }),
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
          method: "POST"
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not add domain.");
        window.location.reload();
      } catch (error) {
        setState({ error: error instanceof Error ? error.message : "Could not add domain." });
      }
    });
  }

  function handleVerify(domainId: string) {
    startTransition(async () => {
      try {
        setState({});
        setVerifyingId(domainId);
        const csrfToken = await getCsrfToken();
        const response = await fetch("/api/manager/domains", {
          body: JSON.stringify({ domainId }),
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
          method: "PATCH"
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not verify domain.");
        window.location.reload();
      } catch (error) {
        setState({ error: error instanceof Error ? error.message : "Could not verify domain." });
      } finally {
        setVerifyingId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] bg-accent/5 p-4 sm:p-5">
        <p className="text-sm leading-6 text-muted">
          Add your company domain to make verification smoother and prepare for trusted organization joining.
        </p>
        <form action={handleSubmit} className="mt-4 flex flex-col gap-3 md:flex-row">
          <Input className="flex-1" name="domain" placeholder="company.com" />
          <Button disabled={pending} type="submit">
            {pending ? "Adding..." : "Add domain"}
          </Button>
        </form>
      </div>
      <FormMessage state={state} />
      <div className="rounded-[1.75rem] border border-border/70 bg-white/70 p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
          Verification flow
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Add the TXT record, wait for DNS to update, and then verify ownership here. Once confirmed, the domain can become a trusted signal for your workspace.
        </p>
      </div>
      <div className="space-y-3">
        {domains.length === 0 ? (
          <p className="text-sm text-muted">No domains added yet.</p>
        ) : (
          domains.map((domain) => (
            <ManagerDomainItem
              key={domain.id}
              disabled={pending}
              domain={domain}
              onVerify={handleVerify}
              verifying={verifyingId === domain.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
