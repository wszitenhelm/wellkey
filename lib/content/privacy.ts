export type PrivacyCardContent = {
  title: string;
  description: string;
};

export const privacyCards: PrivacyCardContent[] = [
  {
    title: "No email required",
    description: "Your identity never enters the flow."
  },
  {
    title: "No manager access",
    description: "Nobody gets a dashboard for your activity."
  },
  {
    title: "No individual reports",
    description: "Your reflections are not tied to your real-world identity."
  },
  {
    title: "Delete anytime",
    description: "You stay in control of your data."
  }
];
