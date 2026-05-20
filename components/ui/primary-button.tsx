import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PrimaryButtonProps = ComponentProps<typeof Button>;

export function PrimaryButton({ className, ...props }: PrimaryButtonProps) {
  return (
    <Button
      className={cn("h-12 rounded-full px-6 text-sm font-semibold shadow-soft", className)}
      {...props}
    />
  );
}
