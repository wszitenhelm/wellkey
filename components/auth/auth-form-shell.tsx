import type { ReactNode } from "react";
import { SoftCard } from "@/components/ui/soft-card";

type AuthFormShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthFormShell({ title, description, children }: AuthFormShellProps) {
  return (
    <SoftCard className="p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Your space</p>
      <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-tight">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      <div className="mt-6">{children}</div>
    </SoftCard>
  );
}
