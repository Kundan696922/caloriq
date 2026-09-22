const { AppError } = require("../middleware/errorHandler");
const { getFullCalorieProfile } = require("./calorieCalculations");

const REQUIRED_PROFILE_FIELDS = [
  "age",
  "gender",
  "heightCm",
  "weightKg",
  "activityLevel",
  "goal",
  "goalSpeed",
];

/**
 * Same logic as getProfileTarget() in dashboard.controller.js, extracted so the
 * meals feature can reuse it. (Optional cleanup later: make dashboard.controller
 * import this instead of keeping its own copy.)
 */
function getProfileTarget(user) {
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

  return getFullCalorieProfile(profile);
}

module.exports = { REQUIRED_PROFILE_FIELDS, getProfileTarget };