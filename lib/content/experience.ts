import type { CheckInFactor, HabitReflection, ReminderNoteKind } from "@/lib/types";

export const landingContent = {
  privacyLine: "Private. Anonymous. Just for you.",
  primaryCta: "Start check-in",
  secondaryCta: "Skip for now",
  subtitle: "Quick check-ins help you notice patterns and feel better over time.",
  title: "Take a moment.",
  body: "You don't have to carry everything at once."
} as const;

export const focusCards = [
  {
    title: "Today's focus: Recovery",
    subtitle: "A small reset might help your body and mind recover."
  },
  {
    title: "Today's focus: Clarity",
    subtitle: "Let's make today feel a little lighter."
  },
  {
    title: "Today's focus: Boundaries",
    subtitle: "One small step is enough."
  }
] as const;

export const insightCards = [
  "You often feel more drained when work feels unclear.",
  "Short breaks seem to help your energy recover.",
  "After heavy days, a small shutdown ritual may help."
] as const;

export const checkInNextSteps = [
  "Take a 2-minute breathing pause",
  "Write tomorrow's top 3 priorities",
  "Step away from work for 10 minutes"
] as const;

export const chatQuickReplies: { label: string; value: string }[] = [
  { label: "Workload", value: "Workload" },
  { label: "Meetings", value: "Meetings" },
  { label: "Sleep", value: "Sleep" },
  { label: "Unclear priorities", value: "Unclear priorities" },
  { label: "People", value: "People" },
  { label: "Not sure", value: "Not sure" }
];

export const reminderNoteCategories: { label: string; value: ReminderNoteKind }[] = [
  { label: "Something good about me", value: "self_kindness" },
  { label: "Gratitude", value: "gratitude" },
  { label: "A small win", value: "small_win" },
  { label: "Something I handled", value: "something_i_handled" },
  { label: "What I need today", value: "what_i_need_today" }
];

export const habitReflectionOptions: { label: string; value: HabitReflection }[] = [
  { label: "A little", value: "a_little" },
  { label: "Yes", value: "yes" },
  { label: "Not today", value: "not_today" }
];

export function getDailyFocus() {
  return focusCards[new Date().getDate() % focusCards.length];
}

export function getMockInsight() {
  return insightCards[new Date().getDate() % insightCards.length];
}

export function getCompletionStepIndex(factor?: CheckInFactor | null) {
  if (factor === "sleep") return 0;
  if (factor === "unclear_priorities") return 1;
  if (factor === "workload" || factor === "meetings") return 2;
  return new Date().getDate() % checkInNextSteps.length;
}

export function getCompletionStep(factor?: CheckInFactor | null) {
  return checkInNextSteps[getCompletionStepIndex(factor)];
}
