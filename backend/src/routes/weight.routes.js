const express = require("express");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  addWeightEntry,
  getWeightHistory,
  deleteWeightEntry,
  getWeightStats,
} = require("../controllers/weight.controller");
const {
  weightEntryRules,
  dateRangeQueryRules,
  entryIdParamRule,
} = require("../utils/weightValidation");

const router = express.Router();

// All weight routes require a logged-in user.
router.use(protect);

// GET /api/weight/stats  (chart data, changes over time, goal progress)
// Declared before "/:entryId"-shaped routes to avoid any path collision.
router.get("/stats", getWeightStats);

// GET /api/weight/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get("/history", dateRangeQueryRules, validate, getWeightHistory);

// POST /api/weight
router.post("/", weightEntryRules, validate, addWeightEntry);

// DELETE /api/weight/:entryId
router.delete("/:entryId", entryIdParamRule, validate, deleteWeightEntry);

module.exports = router;
