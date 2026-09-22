const { body, param, query } = require("express-validator");

const dateQueryRule = query("date")
  .optional()
  .matches(/^\d{4}-\d{2}-\d{2}$/)
  .withMessage("date must be in YYYY-MM-DD format.");

const logEntryRules = [
  body("date")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("date must be in YYYY-MM-DD format."),

  body("fdcId").notEmpty().withMessage("fdcId is required."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("description is required.")
    .isLength({ max: 200 })
    .withMessage("description must not exceed 200 characters."),

  body("servingSize")
    .isFloat({ min: 0 })
    .withMessage("servingSize must be a positive number."),

  body("servingSizeUnit")
    .trim()
    .notEmpty()
    .withMessage("servingSizeUnit is required."),

  body("quantity")
    .optional()
    .isFloat({ min: 0.1, max: 50 })
    .withMessage("quantity must be between 0.1 and 50."),

  body("nutrients").isObject().withMessage("nutrients is required."),
  body("nutrients.calories").optional().isFloat({ min: 0 }),
  body("nutrients.protein").optional().isFloat({ min: 0 }),
  body("nutrients.fat").optional().isFloat({ min: 0 }),
  body("nutrients.carbs").optional().isFloat({ min: 0 }),
  body("nutrients.fiber").optional().isFloat({ min: 0 }),
  body("nutrients.sugars").optional().isFloat({ min: 0 }),
  body("nutrients.sodium").optional().isFloat({ min: 0 }),
];


const updateLogEntryRules = [
  param("entryId").isMongoId().withMessage("Invalid entry id."),
  body("quantity")
    .isFloat({ min: 0.1, max: 50 })
    .withMessage("quantity must be between 0.1 and 50."),
  body("date")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("date must be in YYYY-MM-DD format."),
];

const deleteEntryRules = [
  param("entryId").isMongoId().withMessage("Invalid entry id."),
];

module.exports = { dateQueryRule, logEntryRules, updateLogEntryRules, deleteEntryRules };
