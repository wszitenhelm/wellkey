import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-[calc(env(safe-area-inset-top,0px)+1rem)] sm:px-6 sm:pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] sm:pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] lg:px-8",
        className
      )}
    >
      {children}
    </main>
  );
}
