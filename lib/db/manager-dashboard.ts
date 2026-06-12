import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getOrganizationSupabaseServerClient } from "@/lib/supabase/organization-server";
import type {
  ManagerDashboardData,
  ManagerFactor,
  ManagerRecommendation,
  ManagerSignal,
  OrganizationSessionPayload
} from "@/lib/types";

type AggregateRow = {
  active_employee_count: number;
  avg_e: number | null;
  avg_p: number | null;
  avg_risk_score: number | null;
  avg_s: number | null;
  avg_sup: number | null;
  date: string;
  eligible_reporting_count: number;
  median_risk_score: number | null;
};

type FactorRow = {
  avg_value: number | null;
  factor_key: string;
  worsening_count: number;
};

function toPercent(value: number | null) {
  return value === null ? null : Math.round(value * 100);
}

function toLevel(percent: number | null): ManagerSignal["level"] {
  if (percent === null || percent < 31) return "steady";
  if (percent < 56) return "watch";
  if (percent < 76) return "elevated";
  return "critical";
}

function createSignal(key: ManagerSignal["key"], label: string, value: number | null, summary: string): ManagerSignal {
  const percent = toPercent(value);
  return { key, label, level: toLevel(percent), percent, score: value, summary, trend: null };
}

export async function getManagerDashboardData(
  session: OrganizationSessionPayload
): Promise<ManagerDashboardData> {
  const supabase = await getOrganizationSupabaseServerClient(session);
  const aggregate = (unwrapSupabaseData(
    await supabase
      .from("organization_daily_aggregates")
      .select("date, active_employee_count, eligible_reporting_count, avg_risk_score, median_risk_score, avg_e, avg_s, avg_p, avg_sup")
      .eq("organization_id", session.organizationId)
      .is("team_id", null)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle()
  ) ?? null) as AggregateRow | null;

  const factors = (unwrapSupabaseData(
    await supabase
      .from("organization_factor_aggregates")
      .select("factor_key, avg_value, worsening_count")
      .eq("organization_id", session.organizationId)
      .is("team_id", null)
      .eq("date", aggregate?.date ?? "")
  ) ?? []) as FactorRow[];

  const topFactors: ManagerFactor[] = factors
    .sort((a, b) => (b.avg_value ?? 0) - (a.avg_value ?? 0))
    .slice(0, 4)
    .map((factor) => ({
      count: factor.worsening_count,
      label: factor.factor_key.toUpperCase(),
      share: Math.round((factor.avg_value ?? 0) * 100)
    }));

  const signals = [
    createSignal("burnout", "Burnout signal", aggregate?.avg_risk_score ?? null, "Aggregate risk estimate based on anonymous signals."),
    createSignal("sleep", "Sleep and recovery", aggregate?.avg_s ?? null, "Recovery strain across recent anonymous reporting."),
    createSignal("priorities", "Priority clarity", aggregate?.avg_p ?? null, "Signal for unclear priorities and role clarity strain."),
    createSignal("support", "Support signal", aggregate?.avg_sup ?? null, "How strongly low support is showing up recently.")
  ];

  const recommendations: ManagerRecommendation[] =
    aggregate?.eligible_reporting_count
      ? [
          { title: "Protect recovery windows", body: "Reduce late-day urgency and repeated after-hours escalation when possible." },
          { title: "Clarify top priorities", body: "Use short written priority lists to reduce ambiguity and cognitive load." },
          { title: "Keep support visible", body: "Encourage lightweight check-ins and manager availability without asking for private details." }
        ]
      : [
          { title: "No anonymous aggregate data yet", body: "As employees connect privately, anonymous aggregate trends will appear here." }
        ];

  return {
    recommendations,
    signals,
    summary: {
      checkInCount: aggregate?.eligible_reporting_count ?? 0,
      quickCount: 0,
      regularCount: 0,
      responderCount: aggregate?.active_employee_count ?? 0,
      windowDays: 30
    },
    topFactors
  };
}
