/**
 * Dashboard aggregation helpers (Phase 5).
 *
 * These operate on already-scaled entry nutrients (see DailyLog model) and
 * the calorie/macro target produced by calorieCalculations.getFullCalorieProfile.
 * Kept separate from calorieCalculations.js because that file owns the
 * BMR/TDEE/target FORMULAS, while this file owns SUMMING logged data against
 * that target — different responsibility, same "one source of truth" spirit.
 */

const NUTRIENT_KEYS = [
  "calories",
  "protein",
  "fat",
  "carbs",
  "fiber",
  "sugars",
  "sodium",
];

/**
 * Scales a food's per-serving nutrients by a logged quantity multiplier.
 * Used when an entry is first created, before it's saved as a snapshot.
 */
function scaleNutrients(nutrients, quantity) {
  const scaled = {};
  NUTRIENT_KEYS.forEach((key) => {
    const value = nutrients?.[key];
    scaled[key] =
      typeof value === "number" ? Math.round(value * quantity * 10) / 10 : 0;
  });
  return scaled;
}

/**
 * Sums nutrients across all of a day's logged entries.
 */
function sumEntries(entries = []) {
  const totals = Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, 0]));

  entries.forEach((entry) => {
    NUTRIENT_KEYS.forEach((key) => {
      totals[key] += entry.nutrients?.[key] ?? 0;
    });
  });

  NUTRIENT_KEYS.forEach((key) => {
    totals[key] = Math.round(totals[key] * 10) / 10;
  });

  return totals;
}

/**
 * Computes calories/macros remaining for the day given a calorie+macro
 * target (from getFullCalorieProfile) and the day's logged totals.
 * Values are allowed to go negative (over target) — the frontend decides
 * how to display that, this just does the math.
 */
function getRemaining({ target, totals }) {
  return {
    calories: Math.round(target.calorieTarget - totals.calories),
    protein: Math.round(target.macros.protein.grams - totals.protein),
    fat: Math.round(target.macros.fat.grams - totals.fat),
    carbs: Math.round(target.macros.carbs.grams - totals.carbs),
  };
}

module.exports = { NUTRIENT_KEYS, scaleNutrients, sumEntries, getRemaining };
