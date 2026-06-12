import { cn } from "@/lib/utils";

type LandingBreathingGraphicProps = {
  expanded?: boolean;
  className?: string;
  sizeClassName?: string;
};

export function LandingBreathingGraphic({
  expanded = false,
  className,
  sizeClassName
}: LandingBreathingGraphicProps) {
  return (
    <div
      className={cn(
        "relative mx-auto transition-all duration-[1600ms] ease-out",
        sizeClassName ?? (expanded ? "h-[min(78vw,34rem)] w-[min(78vw,34rem)]" : "h-56 w-56"),
        className
      )}
    >
      <div className="absolute inset-0 animate-breathe rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute inset-[12%] animate-breathe-delayed rounded-full border border-accent/25 bg-white/30" />
      <div className="absolute inset-[24%] rounded-full bg-gradient-to-br from-white via-[#f9f5ec] to-accent/20 shadow-soft" />
      <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-accent/20 via-white to-[#efe6d3]" />
    </div>
  );
}
