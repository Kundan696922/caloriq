const { query, param } = require("express-validator");

/**
 * GET /api/foods/search?q=...&pageSize=...&pageNumber=...
 */
const searchRules = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("A search query is required.")
    .isLength({ min: 2, max: 200 })
    .withMessage("Search query must be between 2 and 200 characters."),

  query("pageSize")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("pageSize must be an integer between 1 and 50.")
    .toInt(),

  query("pageNumber")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("pageNumber must be an integer between 1 and 100.")
    .toInt(),
];

/**
 * GET /api/foods/:fdcId
 */
const lookupRules = [
  param("fdcId")
    .trim()
    .notEmpty()
    .withMessage("A food ID is required.")
    .isInt({ min: 1 })
    .withMessage("Food ID must be a positive integer.")
    .toInt(),
];

module.exports = { searchRules, lookupRules };
