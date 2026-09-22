const express = require("express");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  getDashboard,
  addLogEntry,
  updateLogEntry,
  deleteLogEntry,
} = require("../controllers/dashboard.controller");
const {
  dateQueryRule,
  logEntryRules,
  updateLogEntryRules,
  deleteEntryRules,
} = require("../utils/dashboardValidation");

const router = express.Router();

// All dashboard routes require a logged-in user.
router.use(protect);

// GET /api/dashboard/today?date=YYYY-MM-DD
router.get("/today", dateQueryRule, validate, getDashboard);

// POST /api/dashboard/log
router.post("/log", logEntryRules, validate, addLogEntry);

router.patch("/log/:entryId", updateLogEntryRules, validate, updateLogEntry);

// DELETE /api/dashboard/log/:entryId?date=YYYY-MM-DD
router.delete(
  "/log/:entryId",
  deleteEntryRules,
  dateQueryRule,
  validate,
  deleteLogEntry,
);

module.exports = router;
