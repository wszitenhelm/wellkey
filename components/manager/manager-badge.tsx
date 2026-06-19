import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  tone?: "muted" | "teal";
};

const tones = {
  muted: "bg-foreground/5 text-foreground/70",
  teal: "bg-accent/10 text-accent"
} as const;

export function ManagerBadge({ children, className, tone = "muted" }: Props) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.14em] uppercase",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
