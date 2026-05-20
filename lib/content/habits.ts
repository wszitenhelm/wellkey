export type StarterHabit = {
  description: string;
  slug: string;
  title: string;
};

export const starterHabits: StarterHabit[] = [
  {
    slug: "take-a-10-minute-reset",
    title: "Take a 10-minute reset",
    description: "A short pause can help your body and mind recover."
  },
  {
    slug: "breathing-pause",
    title: "Take one slow breathing pause",
    description: "A short reset between tasks to soften pressure."
  },
  {
    slug: "kind-note",
    title: "Write one kind sentence to yourself",
    description: "A small reminder that effort counts, even on messy days."
  },
  {
    slug: "no-work-after-7-pm",
    title: "No work after 7 p.m.",
    description: "A gentle boundary for steadier evenings."
  },
  {
    slug: "top-three-priorities",
    title: "Write tomorrow's top 3 priorities",
    description: "A small clarity habit for a lighter start."
  }
];
