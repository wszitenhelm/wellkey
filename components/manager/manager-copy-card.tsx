"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  value: string;
};

export function ManagerCopyCard({ label, value }: Props) {
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
    <div className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 break-all font-medium">{value}</p>
      <Button className="mt-4" disabled={pending} onClick={handleCopy} type="button" variant="ghost">
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
