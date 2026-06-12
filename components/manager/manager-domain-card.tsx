"use client";

import { useState, useTransition } from "react";
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
      <form action={handleSubmit} className="flex flex-col gap-3 md:flex-row">
        <Input className="flex-1" name="domain" placeholder="company.com" />
        <Button disabled={pending} type="submit">{pending ? "Adding..." : "Add domain"}</Button>
      </form>
      <FormMessage state={state} />
      <div className="space-y-3">
        {domains.length === 0 ? (
          <p className="text-sm text-muted">No verified domains yet.</p>
        ) : (
          domains.map((domain) => (
            <div key={domain.id} className="rounded-2xl border border-border/70 bg-white/70 p-4">
              <p className="font-medium">{domain.domain}</p>
              <p className="mt-2 text-xs text-muted">Add TXT record: {domain.verification_token}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-accent">
                {domain.verified_at ? "Verified" : "Pending verification"}
              </p>
              {!domain.verified_at ? (
                <Button
                  className="mt-3"
                  disabled={pending}
                  onClick={() => handleVerify(domain.id)}
                  type="button"
                >
                  {verifyingId === domain.id ? "Checking..." : "Verify now"}
                </Button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
