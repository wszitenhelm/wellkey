import type { HTMLAttributes } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SoftCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn(
        "rounded-[2rem] border-white/70 bg-card/95 shadow-soft backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
