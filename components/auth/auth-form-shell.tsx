import type { ReactNode } from "react";
import { SoftCard } from "@/components/ui/soft-card";

type AuthFormShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthFormShell({ title, description, children }: AuthFormShellProps) {
  return (
    <SoftCard className="mx-auto w-full max-w-[34rem] rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-soft sm:p-8 lg:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Your space</p>
      <h1 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-[family-name:var(--font-heading)] leading-[0.96]">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-[0.98rem]">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </SoftCard>
  );
}
