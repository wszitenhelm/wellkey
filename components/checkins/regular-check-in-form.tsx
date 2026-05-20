import { regularCheckInSections } from "@/lib/content/check-ins";
import { RatingScale } from "@/components/checkins/rating-scale";

type RegularCheckInFormProps = {
  currentPath: string;
};

export function RegularCheckInForm({ currentPath }: RegularCheckInFormProps) {
  return (
    <>
      <input name="mode" type="hidden" value="regular" />
      <input name="currentPath" type="hidden" value={currentPath} />
      <div className="space-y-6">
        {regularCheckInSections.map((section) => (
          <div
            key={section.questions[0]?.id}
            className="space-y-5 rounded-[1.75rem] bg-foreground/5 p-4"
          >
            <div className="space-y-5">
              {section.questions.map((question) => (
                <RatingScale
                  key={question.id}
                  endLabels={question.endLabels}
                  name={question.id}
                  title={question.label}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
