/**
 * Weight & Progress aggregation helpers (Phase 6).
 *
 * Same split of responsibility as dashboardCalculations.js: this file owns
 * pure math over already-fetched WeightEntry documents. It knows nothing
 * about Mongoose, req/res, or the User model beyond the plain `profile`
 * object it's handed.
 */

function round1(n) {
  return Math.round(n * 10) / 10;
}

/**
 * Ensures entries are ascending by date ('YYYY-MM-DD' sorts lexicographically
 * the same as chronologically, so a plain string compare is enough).
 */
function sortAscending(entries = []) {
  return [...entries].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
}

/**
 * Simple moving average over the trailing `windowSize` entries, computed
 * per point along the (ascending) series. Used to smooth day-to-day noise
 * (water weight, etc.) for chart display.
 */
function movingAverage(entriesAsc, windowSize = 7) {
  return entriesAsc.map((entry, idx) => {
    const start = Math.max(0, idx - windowSize + 1);
    const window = entriesAsc.slice(start, idx + 1);
    const avg = window.reduce((sum, e) => sum + e.weightKg, 0) / window.length;
    return { date: entry.date, weightKg: entry.weightKg, average: round1(avg) };
  });
}

/**
 * Net and average-per-week change between the earliest and latest entry
 * in the given (already date-filtered) set. Returns null fields if fewer
 * than 2 entries exist — not enough data for a trend yet.
 */
function computeChange(entriesAsc) {
  if (entriesAsc.length < 2) {
    return { netChangeKg: null, perWeekKg: null, days: null };
  }

  const first = entriesAsc[0];
  const last = entriesAsc[entriesAsc.length - 1];
  const days = Math.max(
    1,
    Math.round((new Date(last.date) - new Date(first.date)) / 86400000),
  );
  const netChangeKg = round1(last.weightKg - first.weightKg);
  const perWeekKg = round1((netChangeKg / days) * 7);

  return { netChangeKg, perWeekKg, days };
}

/**
 * Progress toward a goal weight, given the user's profile (startWeightKg /
 * goalWeightKg, both optional) and their weight history. Falls back to the
 * earliest logged entry as the "start" if the user never set startWeightKg
 * explicitly. Returns `null` if there isn't enough to compute progress from
 * (no goal set, or literally no data at all).
 */
function computeGoalProgress({ profile = {}, entriesAsc = [] }) {
  const { goalWeightKg } = profile;
  if (typeof goalWeightKg !== "number") return null;

  const startWeightKg =
    typeof profile.startWeightKg === "number"
      ? profile.startWeightKg
      : entriesAsc[0]?.weightKg;

  const currentWeightKg = entriesAsc[entriesAsc.length - 1]?.weightKg;

  if (
    typeof startWeightKg !== "number" ||
    typeof currentWeightKg !== "number"
  ) {
    return null;
  }

  const totalToLose = startWeightKg - goalWeightKg; // negative if goal is to gain
  const madeSoFar = startWeightKg - currentWeightKg;

  // Avoid divide-by-zero when start === goal (goal already met at baseline).
  const percentComplete =
    totalToLose === 0
      ? 100
      : Math.min(100, Math.max(0, round1((madeSoFar / totalToLose) * 100)));

  return {
    startWeightKg: round1(startWeightKg),
    currentWeightKg: round1(currentWeightKg),
    goalWeightKg: round1(goalWeightKg),
    remainingKg: round1(currentWeightKg - goalWeightKg),
    percentComplete,
  };
}

/**
 * Bundles everything the "Progress statistics" screen needs from one call:
 * chart series (raw + moving average), summary stats over a few standard
 * windows, and goal progress if a goal is set.
 */
function buildProgressStats({ entries = [], profile = {} }) {
  const entriesAsc = sortAscending(entries);
  const now = entriesAsc[entriesAsc.length - 1]?.date;

  const windowEntries = (days) => {
    if (!now) return [];
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return entriesAsc.filter((e) => e.date >= cutoffStr);
  };

  return {
    latest: entriesAsc[entriesAsc.length - 1] ?? null,
    totalEntries: entriesAsc.length,
    chart: entriesAsc.map((entry) => ({
  date: entry.date,
  weightKg: entry.weightKg,
})),
    changes: {
      last7Days: computeChange(windowEntries(7)),
      last30Days: computeChange(windowEntries(30)),
      last90Days: computeChange(windowEntries(90)),
      allTime: computeChange(entriesAsc),
    },
    goalProgress: computeGoalProgress({ profile, entriesAsc }),
  };
}

module.exports = {
  sortAscending,
  movingAverage,
  computeChange,
  computeGoalProgress,
  buildProgressStats,
};
