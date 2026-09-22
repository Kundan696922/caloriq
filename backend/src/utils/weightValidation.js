const { body, query, param } = require("express-validator");

// If your dashboardValidation.js exports differently-named/shaped helpers
// (e.g. wraps express-validator's checks in a custom builder), match that
// shape here instead — this assumes the same raw express-validator style
// `validate` (middleware/validate.js) expects.

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const dateBodyRule = [
  body("date")
    .optional()
    .matches(DATE_REGEX)
    .withMessage("date must be in YYYY-MM-DD format."),
];

const weightEntryRules = [
  ...dateBodyRule,
  body("weightKg")
    .exists({ checkFalsy: true })
    .withMessage("weightKg is required.")
    .bail()
    .isFloat({ min: 25, max: 300 })
    .withMessage("weightKg must be between 25 and 300."),
  body("note")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 280 })
    .withMessage("note must be 280 characters or fewer."),
];

const dateRangeQueryRules = [
  query("startDate")
    .optional()
    .matches(DATE_REGEX)
    .withMessage("startDate must be in YYYY-MM-DD format."),
  query("endDate")
    .optional()
    .matches(DATE_REGEX)
    .withMessage("endDate must be in YYYY-MM-DD format."),
];

const entryIdParamRule = [
  param("entryId").isMongoId().withMessage("Invalid entry id."),
];

module.exports = {
  weightEntryRules,
  dateRangeQueryRules,
  entryIdParamRule,
};
