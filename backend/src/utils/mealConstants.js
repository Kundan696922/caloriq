/**
 * Shared constants for the AI Meals feature (Phase 7).
 * Kept in one place so the model, validators, prompts and service never drift.
 */

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

// "meal_share": size the meal as a share of the DAILY target.
// "remaining_today": size the meal from what's left today (capped, see below).
const FIT_TO_OPTIONS = ["meal_share", "remaining_today"];

// Preferences the user can pick. Some are enforced server-side by
// dietaryGuard.js (vegetarian, vegan, pescatarian, gluten_free, dairy_free,
// halal); the rest are passed to the AI as guidance only.
const DIETARY_PREFERENCES = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten_free",
  "dairy_free",
  "halal",
  "keto",
  "low_carb",
  "high_protein",
];

const INGREDIENT_SOURCES = ["usda", "ai_estimate"];

// Default share of the daily calorie/macro target for each meal type (sums to 1).
const MEAL_SHARES = {
  breakfast: 0.25,
  lunch: 0.3,
  dinner: 0.3,
  snack: 0.15,
};

// Upper bound for a single meal when sizing from "remaining today", so one
// meal can never be asked to swallow the whole remaining budget.
const MAX_SINGLE_MEAL_SHARE = {
  breakfast: 0.4,
  lunch: 0.45,
  dinner: 0.5,
  snack: 0.25,
};

const MIN_REMAINING_CALORIES = 150;
const CALORIE_TOLERANCE = 0.15; // +/-15% of the meal's calorie target

const LIMITS = {
  titleMax: 100,
  descriptionMax: 300,
  ingredientNameMax: 80,
  searchTermMax: 100,
  instructionMax: 500,
  maxIngredients: 20,
  maxInstructions: 15,
  maxIngredientGrams: 1500,
  maxSavedMeals: 500,
};

module.exports = {
  MEAL_TYPES,
  FIT_TO_OPTIONS,
  DIETARY_PREFERENCES,
  INGREDIENT_SOURCES,
  MEAL_SHARES,
  MAX_SINGLE_MEAL_SHARE,
  MIN_REMAINING_CALORIES,
  CALORIE_TOLERANCE,
  LIMITS,
};
