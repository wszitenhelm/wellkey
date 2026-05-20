import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-36 w-full rounded-3xl border border-border bg-white px-4 py-3 text-base outline-none transition placeholder:text-muted focus:border-accent",
        className
      )}
      {...props}
    />
  );
}
