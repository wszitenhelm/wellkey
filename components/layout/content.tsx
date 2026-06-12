import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContentProps = {
  children: ReactNode;
  className?: string;
  overflow?: "auto" | "hidden";
};

const overflowClass = {
  auto: "overflow-y-auto",
  hidden: "overflow-hidden"
} as const;

export function Content({ children, className, overflow = "auto" }: ContentProps) {
  return (
    <main className={cn("flex-1", overflowClass[overflow], className)}>
      {children}
    </main>
  );
}
