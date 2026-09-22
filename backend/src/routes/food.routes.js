const express = require("express");
const rateLimit = require("express-rate-limit");

const { search, getById } = require("../controllers/food.controller");
const validate = require("../middleware/validate");
const { searchRules, lookupRules } = require("../utils/foodValidation");

const router = express.Router();

// Search hits an external API on cache misses, and the frontend may not always
// debounce correctly (or a bad actor may bypass the UI entirely), so this is
// rate-limited server-side regardless of client behavior.
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many search requests. Please slow down and try again shortly.",
  },
});

// GET /api/foods/search?q=chicken+breast&pageSize=25&pageNumber=1
router.get("/search", searchLimiter, searchRules, validate, search);

// GET /api/foods/:fdcId
router.get("/:fdcId", lookupRules, validate, getById);

module.exports = router;
