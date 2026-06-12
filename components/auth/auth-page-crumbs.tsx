import Link from "next/link";

type AuthPageCrumbsProps = {
  current: string;
  href?: string;
  label?: string;
};

export function AuthPageCrumbs({
  current,
  href = "/",
  label = "Back to home"
}: AuthPageCrumbsProps) {
  return (
    <div className="mx-auto mb-4 flex w-full max-w-[34rem] items-center gap-3 px-1 text-sm text-muted sm:mb-5">
      <Link
        className="inline-flex items-center gap-2 font-medium text-foreground transition hover:text-accent"
        href={href as never}
      >
        <span aria-hidden="true">←</span>
        <span>{label}</span>
      </Link>
      <span aria-hidden="true" className="text-foreground/30">
        /
      </span>
      <span className="truncate">{current}</span>
    </div>
  );
}
