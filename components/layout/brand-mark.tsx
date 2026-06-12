import Link from "next/link";
import { LandingBreathingGraphic } from "@/components/app/landing-breathing-graphic";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  labelClassName?: string;
  showLabel?: boolean;
};

export function BrandMark({
  className,
  labelClassName,
  showLabel = true
}: BrandMarkProps) {
  return (
    <Link
      aria-label="Go to homepage"
      className={cn("inline-flex items-center gap-3", className)}
      href={"/" as never}
    >
      <LandingBreathingGraphic sizeClassName="h-10 w-10 sm:h-11 sm:w-11" />
      {showLabel ? (
        <span
          className={cn(
            "text-sm font-semibold tracking-[0.18em] text-foreground/75 sm:text-base",
            labelClassName
          )}
        >
          WELLKEY
        </span>
      ) : null}
    </Link>
  );
}
