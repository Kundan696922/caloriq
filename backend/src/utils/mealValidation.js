const { body, param, query } = require("express-validator");
const {
  MEAL_TYPES,
  FIT_TO_OPTIONS,
  DIETARY_PREFERENCES,
  LIMITS,
} = require("./mealConstants");

// Letters (any language), spaces, apostrophes and hyphens only. This keeps
// allergy / cuisine / excluded-food strings from carrying prompt-injection text.
const TERM_PATTERN = /^[\p{L}\s'’-]+$/u;

const dateBodyRule = body("date")
  .optional()
  .matches(/^\d{4}-\d{2}-\d{2}$/)
  .withMessage("date must be in YYYY-MM-DD format.")
  .bail()
  .isISO8601({ strict: true })
  .withMessage("date is not a valid calendar date.");

const idRule = [
  param("id").isMongoId().withMessage("Invalid meal identifier."),
];

function termList(field, label) {
  return [
    body(field)
      .optional()
      .isArray({ max: 10 })
      .withMessage(`${label} must be a list of at most 10 items.`),
    body(`${field}.*`)
      .isString()
      .withMessage(`Each item in ${label} must be text.`)
      .bail()
      .trim()
      .isLength({ min: 2, max: 40 })
      .withMessage(`Each item in ${label} must be 2-40 characters.`)
      .matches(TERM_PATTERN)
      .withMessage(
        `Items in ${label} may only contain letters, spaces and hyphens.`,
      ),
  ];
}

/**
 * POST /api/meals/generate
 */
const generateRules = [
  body("mealType")
    .isIn(MEAL_TYPES)
    .withMessage(`mealType must be one of: ${MEAL_TYPES.join(", ")}.`),

  body("count")
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage("count must be an integer between 1 and 3.")
    .toInt(),

  body("fitTo")
    .optional()
    .isIn(FIT_TO_OPTIONS)
    .withMessage(`fitTo must be one of: ${FIT_TO_OPTIONS.join(", ")}.`),

  dateBodyRule,

  body("dietaryPreferences")
    .optional()
    .isArray({ max: 6 })
    .withMessage("dietaryPreferences must be a list of at most 6 items."),
  body("dietaryPreferences.*")
    .isIn(DIETARY_PREFERENCES)
    .withMessage(
      `Each dietary preference must be one of: ${DIETARY_PREFERENCES.join(", ")}.`,
    ),

  ...termList("allergies", "allergies"),
  ...termList("excludedFoods", "excludedFoods"),

  body("cuisine")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("cuisine must be text.")
    .bail()
    .trim()
    .isLength({ max: 50 })
    .withMessage("cuisine must not exceed 50 characters.")
    .matches(TERM_PATTERN)
    .withMessage("cuisine may only contain letters, spaces and hyphens."),

  body("maxPrepMinutes")
    .optional({ values: "falsy" })
    .isInt({ min: 5, max: 240 })
    .withMessage("maxPrepMinutes must be between 5 and 240.")
    .toInt(),

  body("notes")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("notes must be text.")
    .bail()
    .trim()
    .isLength({ max: 300 })
    .withMessage("notes must not exceed 300 characters."),
];

/**
 * POST /api/meals  (top-level shape only; deep checks live in
 * nutritionValidation.parseMealDraft)
 */
const saveRules = [
  body("title")
    .isString()
    .withMessage("Meal title is required.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Meal title is required.")
    .isLength({ max: LIMITS.titleMax })
    .withMessage(`Meal title must not exceed ${LIMITS.titleMax} characters.`),

  body("mealType")
    .isIn(MEAL_TYPES)
    .withMessage(`mealType must be one of: ${MEAL_TYPES.join(", ")}.`),

  body("ingredients")
    .isArray({ min: 1, max: LIMITS.maxIngredients })
    .withMessage(`A meal needs 1 to ${LIMITS.maxIngredients} ingredients.`),

  body("instructions")
    .isArray({ min: 1, max: LIMITS.maxInstructions })
    .withMessage(
      `A meal needs 1 to ${LIMITS.maxInstructions} instruction steps.`,
    ),
];

/**
 * GET /api/meals?page=&limit=&mealType=&favorite=
 */
const listRules = [
  query("page")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("page must be a positive integer.")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be between 1 and 50.")
    .toInt(),
  query("mealType")
    .optional()
    .isIn(MEAL_TYPES)
    .withMessage(`mealType must be one of: ${MEAL_TYPES.join(", ")}.`),
  query("favorite")
    .optional()
    .isBoolean()
    .withMessage("favorite must be true or false.")
    .toBoolean(),
];

/**
 * PATCH /api/meals/:id/favorite  (body { isFavorite } optional; omit to toggle)
 */
const favoriteRules = [
  ...idRule,
  body("isFavorite")
    .optional()
    .isBoolean()
    .withMessage("isFavorite must be true or false.")
    .toBoolean(),
];

/**
 * POST /api/meals/:id/log
 */
const logRules = [
  ...idRule,
  dateBodyRule,
  body("quantity")
    .optional()
    .isFloat({ min: 0.1, max: 20 })
    .withMessage("quantity must be between 0.1 and 20.")
    .toFloat(),
];

module.exports = {
  idRule,
  generateRules,
  saveRules,
  listRules,
  favoriteRules,
  logRules,
};
