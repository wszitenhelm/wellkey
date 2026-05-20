import { quickCheckInFactors } from "@/lib/content/check-ins";
import { RatingScale } from "@/components/checkins/rating-scale";

type QuickCheckInFormProps = {
  currentPath: string;
};

export function QuickCheckInForm({ currentPath }: QuickCheckInFormProps) {
  return (
    <>
      <input name="mode" type="hidden" value="quick" />
      <input name="currentPath" type="hidden" value={currentPath} />
      <div className="space-y-5">
        <RatingScale
          endLabels={["Low", "High"]}
          name="quick_energy_level"
          title="1. Energy level"
        />
        <RatingScale
          endLabels={["Low", "High"]}
          name="quick_stress_level"
          title="2. Stress level"
        />
        <RatingScale
          endLabels={["Hard", "Easy"]}
          name="quick_switch_off_level"
          title="3. Ability to switch off from work"
        />
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium leading-6 text-foreground">
            What affected you most today?
          </legend>
          <div className="grid gap-2">
            {quickCheckInFactors.map((factor) => (
              <label
                key={factor.value}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3"
              >
                <input name="quick_biggest_factor" required type="radio" value={factor.value} />
                <span className="text-sm text-foreground">{factor.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </>
  );
}
