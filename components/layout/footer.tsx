import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FooterProps = {
  children: ReactNode;
  className?: string;
};

export function Footer({ children, className }: FooterProps) {
  return (
    <footer
      className={cn(
        "pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-6 sm:pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]",
        className
      )}
    >
      {children}
    </footer>
  );
}
