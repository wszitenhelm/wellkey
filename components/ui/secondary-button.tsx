import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SecondaryButtonProps = ComponentProps<typeof Button>;

export function SecondaryButton({ className, variant = "ghost", ...props }: SecondaryButtonProps) {
  return (
    <Button
      className={cn(
        "h-12 rounded-full border border-border/80 bg-white/70 px-6 text-sm font-semibold shadow-soft hover:bg-white",
        className
      )}
      variant={variant}
      {...props}
    />
  );
}
