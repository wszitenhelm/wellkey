export type ActionState = {
  error?: string;
};

export type SessionPayload = {
  userId: string;
};

export type OrganizationSessionPayload = {
  organizationId: string;
  organizationUserId: string;
  permissions: string[];
};

export type OrganizationPermissionKey =
  | "manage_company_profile"
  | "manage_domains"
  | "view_org_members"
  | "manage_org_members"
  | "manage_role_permissions"
  | "view_org_overview"
  | "view_team_breakdowns"
  | "view_reports"
  | "manage_reports"
  | "view_audit_logs";

export type OrganizationDomainRecord = {
  id: string;
  domain: string;
  verification_token: string;
  verification_method: "dns_txt" | "email";
  verified_at: string | null;
  created_at: string;
};

export type OrganizationRecord = {
  id: string;
  slug: string;
  join_code: string | null;
  legal_name: string;
  display_name: string;
  logo_url: string | null;
  primary_domain: string | null;
  website_url: string | null;
  verification_status: "pending" | "verified" | "rejected";
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  billing_address: { text?: string } | null;
};

export type OrganizationSettingsRecord = {
  minimum_reporting_threshold: number;
  allow_domain_join: boolean;
  allow_invite_join: boolean;
  show_team_breakdowns: boolean;
  show_export_button: boolean;
};

export type OrganizationWorkspaceData = {
  organization: OrganizationRecord;
  domains: OrganizationDomainRecord[];
  settings: OrganizationSettingsRecord;
  orgUser: {
    id: string;
    email: string;
  };
  permissions: OrganizationPermissionKey[];
};

export type OrganizationRoleRecord = {
  id: string;
  key: string;
  name: string;
  is_system: boolean;
};

export type OrganizationPermissionRecord = {
  id: string;
  key: OrganizationPermissionKey;
  name: string;
  description: string;
};

export type OrganizationAccessRole = OrganizationRoleRecord & {
  permissionKeys: OrganizationPermissionKey[];
};

export type OrganizationAccessUser = {
  id: string;
  email: string;
  full_name: string | null;
  status: "active" | "invited" | "disabled";
  roleIds: string[];
};

export type OrganizationInviteRecord = {
  created_at: string;
  email: string | null;
  expires_at: string;
  id: string;
};

export type OrganizationAccessData = {
  invites: OrganizationInviteRecord[];
  permissions: OrganizationPermissionRecord[];
  roles: OrganizationAccessRole[];
  users: OrganizationAccessUser[];
};

export type OrganizationTeamRecord = {
  id: string;
  organization_id: string;
  slug: string;
  name: string;
  parent_team_id: string | null;
  created_at: string;
};

export type OrganizationAnonymousMember = {
  id: string;
  org_scoped_employee_id: string;
  join_method: "invite" | "domain" | "code";
  created_at: string;
  teamIds: string[];
};

export type OrganizationTeamsData = {
  members: OrganizationAnonymousMember[];
  teams: OrganizationTeamRecord[];
};

export type OrganizationReportHistoryItem = {
  created_at: string;
  export_format: "pdf" | "csv" | "json";
  file_url: string | null;
  id: string;
  metadata: Record<string, unknown>;
  period_end: string;
  period_start: string;
  report_id: string;
  report_type: "pdf" | "csv";
  status: "pending" | "processing" | "ready" | "failed";
};

export type OrganizationAuditLogRecord = {
  action: string;
  actorEmail: string | null;
  created_at: string;
  id: string;
  metadata: Record<string, unknown>;
};

export type CreatedCredentials = {
  loginCode: string;
  recoveryCode: string;
};

export type SignupActionState = ActionState & {
  credentials?: CreatedCredentials;
};

export type RecoveryActionState = ActionState & {
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

export type ManagerSignalKey = "burnout" | "sleep" | "priorities" | "support";

export type ManagerSignal = {
  key: ManagerSignalKey;
  label: string;
  summary: string;
  score: number | null;
  percent: number | null;
  trend: number | null;
  level: "steady" | "watch" | "elevated" | "critical";
};

export type ManagerFactor = {
  label: string;
  count: number;
  share: number;
};

export type ManagerRecommendation = {
  title: string;
  body: string;
};

export type ManagerDashboardData = {
  signals: ManagerSignal[];
  topFactors: ManagerFactor[];
  recommendations: ManagerRecommendation[];
  summary: {
    checkInCount: number;
    responderCount: number;
    quickCount: number;
    regularCount: number;
    windowDays: number;
  };
};
