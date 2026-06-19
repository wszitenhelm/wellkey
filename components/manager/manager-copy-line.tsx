"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  value: string;
};

export function ManagerCopyLine({ label, value }: Props) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    startTransition(async () => {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <div className="rounded-[1.25rem] border border-border/70 bg-white/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 break-all text-sm font-medium text-foreground">{value}</p>
        <Button disabled={pending} onClick={handleCopy} type="button" variant="ghost">
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
