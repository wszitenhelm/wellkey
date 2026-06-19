"use client";

import { Button } from "@/components/ui/button";
import { ManagerCopyLine } from "@/components/manager/manager-copy-line";
import { getDomainVerificationHost } from "@/lib/organizations/domains";
import type { OrganizationDomainRecord } from "@/lib/types";

type Props = {
  domain: OrganizationDomainRecord;
  disabled: boolean;
  onVerify: (domainId: string) => void;
  verifying: boolean;
};

export function ManagerDomainItem({ domain, disabled, onVerify, verifying }: Props) {
  const isVerified = Boolean(domain.verified_at);

  return (
    <div className="rounded-[1.75rem] border border-border/70 bg-white/80 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-foreground">{domain.domain}</p>
          <p className="mt-1 text-sm text-muted">
            {isVerified
              ? `Verified on ${new Date(domain.verified_at!).toLocaleDateString()}`
              : "Pending DNS verification"}
          </p>
        </div>
        <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {isVerified ? "Verified" : "TXT check"}
        </div>
      </div>

      {!isVerified ? (
        <div className="mt-4 grid gap-3">
          <ManagerCopyLine label="TXT host" value={getDomainVerificationHost(domain.domain)} />
          <ManagerCopyLine label="TXT value" value={domain.verification_token} />
          <div className="rounded-[1.25rem] bg-accent/5 px-4 py-3 text-sm leading-6 text-muted">
            1. Add this TXT record in your DNS provider.
            <br />
            2. Wait a moment for DNS to update.
            <br />
            3. Come back here and run verification.
          </div>
          <Button disabled={disabled} onClick={() => onVerify(domain.id)} type="button">
            {verifying ? "Checking..." : "Verify now"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
