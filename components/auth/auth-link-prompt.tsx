import Link from "next/link";

type AuthLinkPromptProps = {
  href: string;
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
      <Link className="font-semibold text-foreground" href={href as never}>
        {label}
      </Link>
    </p>
  );
}
