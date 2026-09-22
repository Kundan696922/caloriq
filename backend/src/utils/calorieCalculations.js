/**
 * Calorie & macro calculation utilities.
 *
 * These are the ONLY place calorie formulas live on the backend. Both the
 * public calculators and the personalized profile-based targets (Phase 5)
 * reuse these functions so the math never diverges.
 *
 * Formula used: Mifflin-St Jeor Equation (1990) — widely considered the most
 * accurate general-purpose BMR estimate for most adults.
 *   Men:   BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 *   Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
 * For users who select "other", we average the male/female constant, which
 * is the commonly recommended approach when a binary formula doesn't apply.
 */

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // little or no exercise
  light: 1.375, // light exercise 1-3 days/week
  moderate: 1.55, // moderate exercise 3-5 days/week
  active: 1.725, // hard exercise 6-7 days/week
  very_active: 1.9, // very hard exercise & physical job
};

// Daily calorie adjustment (kcal/day) applied on top of TDEE for each goal speed.
const GOAL_ADJUSTMENTS = {
  lose: {
    mild: -250, // ~0.25 kg/week
    moderate: -500, // ~0.5 kg/week
    aggressive: -750, // ~0.75 kg/week
  },
  gain: {
    mild: 250,
    moderate: 500,
    aggressive: 750,
  },
  maintain: {
    standard: 0,
  },
};

// Grams of protein per kg of bodyweight, tuned per goal to help preserve
// lean mass in a deficit and support recovery/growth in a surplus.
const PROTEIN_G_PER_KG = {
  lose: 2.0,
  maintain: 1.6,
  gain: 1.8,
};

// Percentage of total daily calories allocated to fat; carbs fill the remainder.
const FAT_PERCENT_OF_CALORIES = 0.25;

const MIN_CALORIE_FLOOR = 1200; // safety floor so extreme inputs don't produce unsafe targets

function calculateBMR({ age, gender, heightCm, weightKg }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  // 'other' — average of the male (+5) and female (-161) constants
  return base + (5 + -161) / 2;
}

function calculateTDEE({ bmr, activityLevel }) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return bmr * multiplier;
}

/**
 * Computes a goal-adjusted calorie target from a TDEE.
 * @param {number} tdee
 * @param {'lose'|'maintain'|'gain'} goal
 * @param {string} goalSpeed - 'mild' | 'moderate' | 'aggressive' for lose/gain, 'standard' for maintain
 */
function calculateGoalCalories({ tdee, goal, goalSpeed }) {
  const speedMap = GOAL_ADJUSTMENTS[goal];
  const adjustment = speedMap ? speedMap[goalSpeed] ?? 0 : 0;
  const target = tdee + adjustment;
  return Math.max(Math.round(target), MIN_CALORIE_FLOOR);
}

/**
 * Estimates macro targets (grams + calories) from a calorie target and goal.
 * Protein is anchored to bodyweight, fat is a fixed % of calories, and carbs
 * fill the remainder. All values are estimates, not medical advice.
 */
function calculateMacros({ calorieTarget, weightKg, goal }) {
  const proteinPerKg = PROTEIN_G_PER_KG[goal] ?? PROTEIN_G_PER_KG.maintain;
  let proteinGrams = Math.round(proteinPerKg * weightKg);
  let proteinCalories = proteinGrams * 4;

  let fatCalories = Math.round(calorieTarget * FAT_PERCENT_OF_CALORIES);
  let fatGrams = Math.round(fatCalories / 9);

  let remainingCalories = calorieTarget - proteinCalories - fatCalories;

  // Safety net: if protein + fat somehow exceed the target (very low calorie
  // targets combined with a heavy bodyweight), scale protein down proportionally
  // rather than allowing negative carbs.
  if (remainingCalories < 0) {
    const overage = Math.abs(remainingCalories);
    proteinCalories = Math.max(proteinCalories - overage, calorieTarget * 0.2);
    proteinGrams = Math.round(proteinCalories / 4);
    remainingCalories = calorieTarget - proteinCalories - fatCalories;
  }

  const carbGrams = Math.max(Math.round(remainingCalories / 4), 0);
  const carbCalories = carbGrams * 4;

  return {
    protein: { grams: proteinGrams, calories: proteinCalories },
    fat: { grams: fatGrams, calories: fatCalories },
    carbs: { grams: carbGrams, calories: carbCalories },
  };
}

/**
 * Full pipeline: raw profile inputs -> BMR, TDEE, goal calorie target, macros.
 */
function getFullCalorieProfile({ age, gender, heightCm, weightKg, activityLevel, goal, goalSpeed }) {
  const bmr = calculateBMR({ age, gender, heightCm, weightKg });
  const tdee = calculateTDEE({ bmr, activityLevel });
  const calorieTarget = calculateGoalCalories({ tdee, goal, goalSpeed });
  const macros = calculateMacros({ calorieTarget, weightKg, goal });

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget,
    macros,
  };
}

module.exports = {
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  calculateBMR,
  calculateTDEE,
  calculateGoalCalories,
  calculateMacros,
  getFullCalorieProfile,
};
