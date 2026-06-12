import type {
  CheckInFactor,
  ManagerDashboardData,
  ManagerRecommendation,
  ManagerSignal,
  ManagerSignalKey
} from "@/lib/types";

type ManagerRow = {
  completed_on: string;
  mode: "quick" | "regular";
  user_id: string;
  quick_biggest_factor: CheckInFactor | null;
  quick_score: number | null;
  regular_q10_priorities_clear: number | null;
  regular_q7_recovery_good: number | null;
  regular_q9_supported: number | null;
  regular_score: number | null;
};

const WINDOW_DAYS = 30;
const TREND_DAYS = 7;

const factorLabels: Record<CheckInFactor, string> = {
  interactions_with_others: "Interactions with others",
  meetings: "Meetings",
  sleep: "Sleep and recovery",
  something_else: "Other reported pressure",
  unclear_priorities: "Unclear priorities",
  workload: "Workload"
};

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function reverseScore(value: number | null) {
  return value ? 6 - value : null;
}

function toPercent(score: number | null) {
  if (score === null) {
    return null;
  }

  return Math.round(((score - 1) / 4) * 100);
}

function toLevel(percent: number | null): ManagerSignal["level"] {
  if (percent === null || percent < 35) return "steady";
  if (percent < 55) return "watch";
  if (percent < 75) return "elevated";
  return "critical";
}

function signalSummary(key: ManagerSignalKey, level: ManagerSignal["level"]) {
  const copy: Record<ManagerSignalKey, Record<ManagerSignal["level"], string>> = {
    burnout: {
      steady: "Strain signals are currently contained.",
      watch: "Some strain is building across the team.",
      elevated: "Burnout risk signals are rising and need manager attention.",
      critical: "Burnout pressure looks sustained and high."
    },
    priorities: {
      steady: "Priority clarity looks mostly stable.",
      watch: "Some people may be unclear on what matters most.",
      elevated: "Priority confusion is likely slowing recovery and focus.",
      critical: "Lack of clarity is showing up as a major team burden."
    },
    sleep: {
      steady: "Recovery signals are mostly healthy.",
      watch: "Sleep and recovery may be starting to slip.",
      elevated: "Recovery strain is showing up in recent check-ins.",
      critical: "Sleep and recovery look like a serious pressure point."
    },
    support: {
      steady: "Perceived support is holding up well.",
      watch: "Support may feel inconsistent for part of the team.",
      elevated: "Support signals suggest people may be carrying too much alone.",
      critical: "Low support is likely amplifying stress across the team."
    }
  };

  return copy[key][level];
}

function buildSignal(
  key: ManagerSignalKey,
  label: string,
  recent: number[],
  previous: number[]
): ManagerSignal {
  const score = average(recent);
  const previousScore = average(previous);
  const trend =
    score !== null && previousScore !== null ? Number((score - previousScore).toFixed(2)) : null;
  const percent = toPercent(score);
  const level = toLevel(percent);

  return {
    key,
    label,
    level,
    percent,
    score,
    summary: signalSummary(key, level),
    trend
  };
}

function buildRecommendations(signals: ManagerSignal[], topFactor?: string): ManagerRecommendation[] {
  const recommendations: ManagerRecommendation[] = [];
  const burnout = signals.find((signal) => signal.key === "burnout");
  const sleep = signals.find((signal) => signal.key === "sleep");
  const priorities = signals.find((signal) => signal.key === "priorities");

  if (burnout && burnout.level !== "steady") {
    recommendations.push({
      title: "Reduce parallel pressure",
      body: "Cut active priorities, protect focus time, and make at least one deadline negotiable this week."
    });
  }

  if (sleep && sleep.level !== "steady") {
    recommendations.push({
      title: "Protect recovery",
      body: "Reduce after-hours pings, normalize slower starts after intense days, and avoid late-day escalation when possible."
    });
  }

  if (priorities && priorities.level !== "steady") {
    recommendations.push({
      title: "Clarify what matters most",
      body: "Give every team a top-three priority list, name what can wait, and repeat it in writing after meetings."
    });
  }

  if (topFactor && recommendations.length < 3) {
    recommendations.push({
      title:
        topFactor === "Other reported pressure"
          ? "Investigate uncategorized strain"
          : `Respond to ${topFactor.toLowerCase()}`,
      body:
        topFactor === "Other reported pressure"
          ? "A large share of people are pointing to pressure outside the default categories, so follow-up listening and anonymous prompts are worth adding."
          : "This is the most frequently named pressure point right now, so managers should address it directly in next-step planning."
    });
  }

  return recommendations.slice(0, 3);
}

export function buildManagerDashboard(rows: ManagerRow[]): ManagerDashboardData {
  const today = new Date();
  const recentCutoff = new Date(today);
  recentCutoff.setDate(today.getDate() - TREND_DAYS);
  const previousCutoff = new Date(today);
  previousCutoff.setDate(today.getDate() - TREND_DAYS * 2);

  const responders = new Set(rows.map((row) => row.user_id));
  const recentRows = rows.filter((row) => new Date(row.completed_on) >= recentCutoff);
  const previousRows = rows.filter((row) => {
    const date = new Date(row.completed_on);
    return date >= previousCutoff && date < recentCutoff;
  });

  const burnoutRecent = recentRows.flatMap((row) =>
    row.regular_score ?? row.quick_score ? [Number(row.regular_score ?? row.quick_score)] : []
  );
  const burnoutPrevious = previousRows.flatMap((row) =>
    row.regular_score ?? row.quick_score ? [Number(row.regular_score ?? row.quick_score)] : []
  );
  const sleepRecent = recentRows.flatMap((row) =>
    reverseScore(row.regular_q7_recovery_good) ? [reverseScore(row.regular_q7_recovery_good)!] : []
  );
  const sleepPrevious = previousRows.flatMap((row) =>
    reverseScore(row.regular_q7_recovery_good)
      ? [reverseScore(row.regular_q7_recovery_good)!]
      : []
  );
  const prioritiesRecent = recentRows.flatMap((row) =>
    reverseScore(row.regular_q10_priorities_clear)
      ? [reverseScore(row.regular_q10_priorities_clear)!]
      : []
  );
  const prioritiesPrevious = previousRows.flatMap((row) =>
    reverseScore(row.regular_q10_priorities_clear)
      ? [reverseScore(row.regular_q10_priorities_clear)!]
      : []
  );
  const supportRecent = recentRows.flatMap((row) =>
    reverseScore(row.regular_q9_supported) ? [reverseScore(row.regular_q9_supported)!] : []
  );
  const supportPrevious = previousRows.flatMap((row) =>
    reverseScore(row.regular_q9_supported) ? [reverseScore(row.regular_q9_supported)!] : []
  );

  const signals = [
    buildSignal("burnout", "Burnout signal", burnoutRecent, burnoutPrevious),
    buildSignal("sleep", "Sleep and recovery", sleepRecent, sleepPrevious),
    buildSignal("priorities", "Priority clarity", prioritiesRecent, prioritiesPrevious),
    buildSignal("support", "Support signal", supportRecent, supportPrevious)
  ];

  const factorCounts = rows.reduce<Record<string, number>>((totals, row) => {
    if (!row.quick_biggest_factor) {
      return totals;
    }

    totals[row.quick_biggest_factor] = (totals[row.quick_biggest_factor] ?? 0) + 1;
    return totals;
  }, {});

  const topFactors = Object.entries(factorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([factor, count]) => ({
      count,
      label: factorLabels[factor as CheckInFactor],
      share: rows.length === 0 ? 0 : Math.round((count / rows.length) * 100)
    }));

  return {
    recommendations: buildRecommendations(signals, topFactors[0]?.label),
    signals,
    summary: {
      checkInCount: rows.length,
      quickCount: rows.filter((row) => row.mode === "quick").length,
      regularCount: rows.filter((row) => row.mode === "regular").length,
      responderCount: responders.size,
      windowDays: WINDOW_DAYS
    },
    topFactors
  };
}
