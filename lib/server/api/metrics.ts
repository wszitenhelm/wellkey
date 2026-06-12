type RouteMetrics = {
  durations: number[];
};

const metricsStore = globalThis.__quietlyApiMetrics ?? new Map<string, RouteMetrics>();
globalThis.__quietlyApiMetrics = metricsStore;

declare global {
  var __quietlyApiMetrics: Map<string, RouteMetrics> | undefined;
}

function percentile(values: number[], ratio: number) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1);
  return Math.round(sorted[index]);
}

export function startApiTimer() {
  const startedAt = performance.now();
  return () => Math.round(performance.now() - startedAt);
}

export function recordApiMetric(route: string, durationMs: number) {
  const current = metricsStore.get(route) ?? { durations: [] };
  current.durations.push(durationMs);
  current.durations = current.durations.slice(-250);
  metricsStore.set(route, current);

  return {
    p95: percentile(current.durations, 0.95),
    p99: percentile(current.durations, 0.99)
  };
}
