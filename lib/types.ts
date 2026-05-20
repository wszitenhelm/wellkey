export type ActionState = {
  error?: string;
};

export type SessionPayload = {
  userId: string;
};

export type CreatedCredentials = {
  loginCode: string;
  recoveryCode: string;
};

export type SignupActionState = ActionState & {
  credentials?: CreatedCredentials;
};

export type UserRecord = {
  user_id: string;
  login_code_hash: string;
  password_hash: string;
  recovery_code_hash: string;
  created_at: string;
};

export type AuthenticatedUser = Pick<UserRecord, "password_hash" | "user_id">;

export type ChatSessionRecord = {
  id: string;
  user_id: string;
  summary: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessageRole = "user" | "assistant";

export type ChatMessageRecord = {
  id: string;
  session_id: string;
  user_id: string;
  role: ChatMessageRole;
  content: string;
  created_at: string;
};

export type ChatViewData = {
  session: ChatSessionRecord | null;
  messages: ChatMessageRecord[];
};

export type HabitRecord = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string;
  is_default: boolean;
  order_index: number;
  created_at: string;
  archived_at: string | null;
};

export type HabitCompletionRecord = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_on: string;
  created_at: string;
};

export type HabitWithProgress = HabitRecord & {
  completedToday: boolean;
  streakCount: number;
};

export type ReminderNoteKind =
  | "gratitude"
  | "self_kindness"
  | "small_win"
  | "something_i_handled"
  | "what_i_need_today";
export type HabitReflection = "a_little" | "yes" | "not_today";

export type ReminderNoteRecord = {
  id: string;
  user_id: string;
  kind: ReminderNoteKind;
  content: string;
  created_at: string;
};

export type CheckInActionState = ActionState & {
  nextStep?: string;
  submitted?: boolean;
};

export type CheckInMode = "quick" | "regular";

export type CheckInFactor =
  | "workload"
  | "meetings"
  | "sleep"
  | "unclear_priorities"
  | "interactions_with_others"
  | "something_else";

export type DailyCheckInRecord = {
  id: string;
  user_id: string;
  mode: CheckInMode;
  completed_on: string;
  regular_score: number | null;
  quick_score: number | null;
  quick_energy_level: number | null;
  quick_stress_level: number | null;
  quick_switch_off_level: number | null;
  quick_biggest_factor: CheckInFactor | null;
  regular_q1_drained: number | null;
  regular_q2_enough_energy: number | null;
  regular_q3_switch_off_hard: number | null;
  regular_q4_less_connected: number | null;
  regular_q5_focus_trouble: number | null;
  regular_q6_emotional_strain: number | null;
  regular_q7_recovery_good: number | null;
  regular_q8_workload_manageable: number | null;
  regular_q9_supported: number | null;
  regular_q10_priorities_clear: number | null;
  created_at: string;
};
