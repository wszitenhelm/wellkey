type CheckInQuestion = {
  id: string;
  label: string;
  endLabels?: readonly [string, string];
};

type CheckInSection = {
  title?: string;
  questions: CheckInQuestion[];
};

export const regularCheckInSections: CheckInSection[] = [
  {
    questions: [
      {
        id: "regular_q1_drained",
        label: "1. I feel mentally or physically drained by work.",
        endLabels: ["Not at all", "Very much"]
      },
      {
        id: "regular_q3_switch_off_hard",
        label: "2. I can switch off after work.",
        endLabels: ["Hard", "Easy"]
      }
    ]
  },
  {
    questions: [
      {
        id: "regular_q5_focus_trouble",
        label: "3. I have trouble concentrating.",
        endLabels: ["Not at all", "Very much"]
      }
    ]
  },
  {
    questions: [
      {
        id: "regular_q6_emotional_strain",
        label: "4. I feel irritable, overwhelmed, or emotionally reactive.",
        endLabels: ["Not at all", "Very much"]
      }
    ]
  },
  {
    questions: [
      {
        id: "regular_q7_recovery_good",
        label: "5. My sleep or recovery has been good recently.",
        endLabels: ["Poor", "Good"]
      }
    ]
  },
  {
    questions: [
      {
        id: "regular_q8_workload_manageable",
        label: "6. My workload feels manageable.",
        endLabels: ["Not at all", "Very much"]
      },
      {
        id: "regular_q9_supported",
        label: "7. I feel supported in my work.",
        endLabels: ["Not at all", "Very much"]
      },
      {
        id: "regular_q10_priorities_clear",
        label: "8. I know what my priorities are.",
        endLabels: ["Not at all", "Very much"]
      }
    ]
  }
];

export const quickCheckInFactors = [
  { value: "workload", label: "Workload" },
  { value: "meetings", label: "Meetings" },
  { value: "sleep", label: "Sleep" },
  { value: "unclear_priorities", label: "Unclear priorities" },
  { value: "interactions_with_others", label: "Interactions with others" },
  { value: "something_else", label: "Something else" }
] as const;
