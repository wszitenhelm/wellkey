import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeaderProps = {
  children: ReactNode;
  className?: string;
};

export function Header({ children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "pt-[calc(env(safe-area-inset-top,0px)+1rem)] sm:pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]",
        className
      )}
    >
      {children}
    </header>
  );
}
