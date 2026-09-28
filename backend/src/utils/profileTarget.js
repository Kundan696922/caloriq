const { AppError } = require("../middleware/errorHandler");
const { getFullCalorieProfile } = require("./calorieCalculations");
const WeightEntry = require("../models/WeightEntry");

const REQUIRED_PROFILE_FIELDS = [
  "age",
  "gender",
  "heightCm",
  "activityLevel",
  "goal",
  "goalSpeed",
];

async function getProfileTarget(user) {
  const profile = user.profile || {};

  const missing = REQUIRED_PROFILE_FIELDS.filter(
    (field) => profile[field] === undefined || profile[field] === null,
  );

  if (missing.length > 0) {
    throw new AppError(
      `Complete your profile to generate personalized meals. Missing: ${missing.join(", ")}`,
      400,
    );
  }

  const latestWeight = await WeightEntry.findOne({
    user: user._id,
  })
    .sort({ date: -1 })
    .lean();

  if (!latestWeight) {
    throw new AppError(
      "Add your current weight in Weight Progress before generating personalized meals.",
      400,
    );
  }

  return getFullCalorieProfile({
    ...profile,
    weightKg: latestWeight.weightKg,
  });
}

module.exports = { REQUIRED_PROFILE_FIELDS, getProfileTarget };