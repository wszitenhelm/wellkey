import Link from "next/link";
import type { ComponentProps } from "react";

type AuthLinkPromptProps = {
  href: ComponentProps<typeof Link>["href"];
  label: string;
  prefix: string;
};

export function AuthLinkPrompt({
  href,
  label,
  prefix
}: AuthLinkPromptProps) {
  return (
    <p className="text-center text-sm text-muted">
      {prefix}{" "}
      <Link className="font-semibold text-foreground" href={href}>
        {label}
      </Link>
    </p>
  );
}
