import { cn } from "@/lib/utils";

type RatingScaleProps = {
  endLabels?: readonly [string, string];
  name: string;
  title: string;
};

const values = [1, 2, 3, 4, 5];

export function RatingScale({ endLabels, name, title }: RatingScaleProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium leading-6 text-foreground">{title}</legend>
      <div className="grid grid-cols-5 gap-2">
        {values.map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center justify-center rounded-[1.35rem] border border-border/70 bg-white/80"
          >
            <input className="peer sr-only" name={name} required type="radio" value={value} />
            <span
              className={cn(
                "flex h-12 w-full items-center justify-center rounded-[1.35rem] text-sm font-semibold text-muted transition",
                "peer-checked:bg-accent peer-checked:text-accentForeground peer-checked:ring-2 peer-checked:ring-accent/20"
              )}
            >
              {value}
            </span>
          </label>
        ))}
      </div>
      {endLabels ? (
        <div className="flex justify-between text-xs font-medium text-muted">
          <span>{endLabels[0]}</span>
          <span>{endLabels[1]}</span>
        </div>
      ) : null}
    </fieldset>
  );
}
