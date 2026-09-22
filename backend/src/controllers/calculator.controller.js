const {
  calculateBMR,
  calculateTDEE,
  getFullCalorieProfile,
} = require('../utils/calorieCalculations');

/**
 * POST /api/calculators/maintenance
 * Public. Calculates BMR and maintenance calories (TDEE) from body stats.
 */
function getMaintenanceCalories(req, res) {
  const { age, gender, heightCm, weightKg, activityLevel } = req.body;

  const bmr = calculateBMR({ age, gender, heightCm, weightKg });
  const tdee = calculateTDEE({ bmr, activityLevel });

  res.status(200).json({
    success: true,
    data: {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    },
  });
}

/**
 * POST /api/calculators/goal
 * Public. Calculates a goal-adjusted calorie target and estimated macros.
 */
function getGoalCalories(req, res) {
  const { age, gender, heightCm, weightKg, activityLevel, goal, goalSpeed } = req.body;

  const profile = getFullCalorieProfile({
    age,
    gender,
    heightCm,
    weightKg,
    activityLevel,
    goal,
    goalSpeed,
  });

  res.status(200).json({
    success: true,
    data: profile,
    disclaimer:
      'These figures are estimates based on standard formulas and are not medical advice. Consult a qualified professional for personalized guidance.',
  });
}

module.exports = { getMaintenanceCalories, getGoalCalories };
