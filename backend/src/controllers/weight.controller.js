const WeightEntry = require("../models/WeightEntry");
const { AppError } = require("../middleware/errorHandler");
const { buildProgressStats } = require("../utils/weightCalculations");

/**
 * Returns today's calendar date (or an override) as 'YYYY-MM-DD'.
 * Same convention as dashboard.controller.js's resolveDate — duplicated
 * here rather than imported since it isn't exported from that module.
 * If you'd rather share one implementation, pull this into a small
 * utils/date.js and update both controllers to use it.
 */
function resolveDate(queryDate) {
  if (queryDate) return queryDate;
  return new Date().toISOString().slice(0, 10);
}

/**
 * POST /api/weight
 * Protected. Logs a weight entry for the given date (defaults to today).
 * Logging again on a date that already has an entry updates it in place
 * (upsert), matching how DailyLog handles one-doc-per-day.
 */
async function addWeightEntry(req, res, next) {
  try {
    const date = resolveDate(req.body.date);
    const { weightKg, note } = req.body;

    const entry = await WeightEntry.findOneAndUpdate(
      { user: req.user._id, date },
      {
        $set: { weightKg, note: note ?? "" },
        $setOnInsert: { user: req.user._id, date },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(201).json({ success: true, data: { entry } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/weight/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Protected. Returns weight entries in ascending date order, optionally
 * bounded by a date range. Omitting both returns the full history.
 */
async function getWeightHistory(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = startDate;
    if (endDate) dateFilter.$lte = endDate;

    const query = { user: req.user._id };
    if (Object.keys(dateFilter).length > 0) query.date = dateFilter;

    const entries = await WeightEntry.find(query).sort({ date: 1 });

    res.status(200).json({ success: true, data: { entries } });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/weight/:entryId
 * Protected. Removes a single weight entry belonging to the current user.
 */
async function deleteWeightEntry(req, res, next) {
  try {
    const { entryId } = req.params;

    const entry = await WeightEntry.findOneAndDelete({
      _id: entryId,
      user: req.user._id,
    });

    if (!entry) {
      return next(new AppError("Weight entry not found.", 404));
    }

    res.status(200).json({ success: true, data: { entry } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/weight/stats
 * Protected. Returns chart-ready history (with 7-day moving average),
 * change-over-time summaries, and goal progress (if a goal weight is set
 * on the user's profile).
 */
async function getWeightStats(req, res, next) {
  try {
    const entries = await WeightEntry.find({ user: req.user._id }).sort({
      date: 1,
    });

    const stats = buildProgressStats({
      entries,
      profile: req.user.profile || {},
    });

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addWeightEntry,
  getWeightHistory,
  deleteWeightEntry,
  getWeightStats,
};
