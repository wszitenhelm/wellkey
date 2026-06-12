import type { OrganizationReportHistoryItem, OrganizationSessionPayload } from "@/lib/types";
import { unwrapSupabaseData } from "@/lib/supabase/errors";
import { getOrganizationSupabaseServerClient } from "@/lib/supabase/organization-server";

type ReportingRow = {
  date: string;
  active_employee_count: number;
  eligible_reporting_count: number;
  avg_risk_score: number | null;
  median_risk_score: number | null;
  avg_e: number | null;
  avg_s: number | null;
  avg_p: number | null;
  avg_w: number | null;
};

type ReportRow = {
  created_at: string;
  id: string;
  metadata: Record<string, unknown>;
  period_end: string;
  period_start: string;
  report_type: "pdf" | "csv";
  status: "pending" | "processing" | "ready" | "failed";
};

type ReportExportRow = {
  created_at: string;
  export_format: "pdf" | "csv" | "json";
  file_url: string | null;
  id: string;
  metadata: Record<string, unknown>;
  report_id: string;
  status: "pending" | "processing" | "ready" | "failed";
};

export async function getLatestReportingSnapshot(session: OrganizationSessionPayload) {
  const supabase = await getOrganizationSupabaseServerClient(session);

  return (unwrapSupabaseData(
    await supabase
      .from("organization_daily_aggregates")
      .select(
        "date, active_employee_count, eligible_reporting_count, avg_risk_score, median_risk_score, avg_e, avg_s, avg_p, avg_w"
      )
      .eq("organization_id", session.organizationId)
      .is("team_id", null)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle()
  ) ?? null) as ReportingRow | null;
}

export async function createOrganizationReportExport(
  session: OrganizationSessionPayload,
  metadata: Record<string, unknown>
) {
  const supabase = await getOrganizationSupabaseServerClient(session);

  const report = unwrapSupabaseData(
    await supabase
      .from("reports")
      .insert({
        created_by_organization_user_id: session.organizationUserId,
        metadata,
        organization_id: session.organizationId,
        period_end: new Date().toISOString().slice(0, 10),
        period_start: new Date().toISOString().slice(0, 10),
        report_type: "csv",
        status: "ready"
      })
      .select("id")
      .single()
  ) as { id: string } | null;

  if (!report) {
    throw new Error("REPORT_CREATE_FAILED");
  }

  await unwrapSupabaseData(
    await supabase.from("report_exports").insert({
      export_format: "csv",
      metadata,
      report_id: report.id,
      status: "ready"
    })
  );
}

export async function getOrganizationReportHistory(
  session: OrganizationSessionPayload
): Promise<OrganizationReportHistoryItem[]> {
  const supabase = await getOrganizationSupabaseServerClient(session);
  const [reports, exports] = await Promise.all([
    (unwrapSupabaseData(
      await supabase
        .from("reports")
        .select("id, created_at, period_start, period_end, report_type, status, metadata")
        .eq("organization_id", session.organizationId)
        .order("created_at", { ascending: false })
        .limit(20)
    ) ?? []) as ReportRow[],
    (unwrapSupabaseData(
      await supabase
        .from("report_exports")
        .select("id, report_id, export_format, file_url, status, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(20)
    ) ?? []) as ReportExportRow[]
  ]);

  const exportByReportId = new Map(exports.map((entry) => [entry.report_id, entry]));

  return reports.map((report) => {
    const exportRow = exportByReportId.get(report.id);

    return {
      created_at: exportRow?.created_at ?? report.created_at,
      export_format: exportRow?.export_format ?? "csv",
      file_url: exportRow?.file_url ?? null,
      id: exportRow?.id ?? report.id,
      metadata: exportRow?.metadata ?? report.metadata,
      period_end: report.period_end,
      period_start: report.period_start,
      report_id: report.id,
      report_type: report.report_type,
      status: exportRow?.status ?? report.status
    };
  });
}
