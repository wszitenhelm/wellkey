import { getDb } from "@/lib/db/client";
import { buildManagerDashboard } from "@/lib/manager/dashboard";
import type { CheckInFactor, ManagerDashboardData } from "@/lib/types";

type ManagerRow = {
  completed_on: string;
  mode: "quick" | "regular";
  user_id: string;
  quick_biggest_factor: string | null;
  quick_score: number | null;
  regular_q10_priorities_clear: number | null;
  regular_q7_recovery_good: number | null;
  regular_q9_supported: number | null;
  regular_score: number | null;
};

export async function getManagerDashboardData(): Promise<ManagerDashboardData> {
  const db = getDb();
  const rows = await db<ManagerRow[]>`
    select
      completed_on::text,
      mode,
      user_id::text,
      quick_biggest_factor,
      quick_score,
      regular_q10_priorities_clear,
      regular_q7_recovery_good,
      regular_q9_supported,
      regular_score
    from daily_check_ins
    where completed_on >= current_date - interval '30 days'
    order by completed_on desc
  `;

  return buildManagerDashboard(
    rows.map((row) => ({
      ...row,
      quick_biggest_factor: row.quick_biggest_factor as CheckInFactor | null
    }))
  );
}
