type LandingBreathingGraphicProps = {
  expanded?: boolean;
};

export function LandingBreathingGraphic({
  expanded = false
}: LandingBreathingGraphicProps) {
  return (
    <div
      className={`relative mx-auto transition-all duration-[1600ms] ease-out ${
        expanded ? "h-[min(78vw,34rem)] w-[min(78vw,34rem)]" : "h-56 w-56"
      }`}
    >
      <div className="absolute inset-0 animate-breathe rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute inset-6 animate-breathe-delayed rounded-full border border-accent/25 bg-white/30" />
      <div className="absolute inset-12 rounded-full bg-gradient-to-br from-white via-[#f9f5ec] to-accent/20 shadow-soft" />
      <div className="absolute inset-[4.75rem] rounded-full bg-gradient-to-br from-accent/20 via-white to-[#efe6d3]" />
    </div>
  );
}
