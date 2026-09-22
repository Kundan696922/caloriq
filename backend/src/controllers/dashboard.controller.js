const DailyLog = require("../models/DailyLog");
const WeightEntry = require("../models/WeightEntry"); // ADDED
const { AppError } = require("../middleware/errorHandler");
const { getFullCalorieProfile } = require("../utils/calorieCalculations");
const {
  scaleNutrients,
  sumEntries,
  getRemaining,
} = require("../utils/dashboardCalculations");

// "weightKg" removed — weight now comes from WeightEntry, not the profile.
const REQUIRED_PROFILE_FIELDS = [
  "age",
  "gender",
  "heightCm",
  "activityLevel",
  "goal",
  "goalSpeed",
];

function resolveDate(queryDate) {
  if (queryDate) return queryDate;
  return new Date().toISOString().slice(0, 10);
}

// Now async — needs to query WeightEntry for the latest logged weight.
async function getProfileTarget(user) {
  const profile = user.profile || {};
  const missing = REQUIRED_PROFILE_FIELDS.filter(
    (field) => profile[field] === undefined || profile[field] === null,
  );

  if (missing.length > 0) {
    throw new AppError(
      `Complete your profile to see personalized targets. Missing: ${missing.join(", ")}`,
      400,
    );
  }

  const latestEntry = await WeightEntry.findOne({ user: user._id }).sort({
    date: -1,
  });

  if (!latestEntry) {
    throw new AppError("Log your weight to see personalized targets.", 400);
  }

  return getFullCalorieProfile({ ...profile, weightKg: latestEntry.weightKg });
}

async function getDashboard(req, res, next) {
  try {
    const date = resolveDate(req.query.date);
    const target = await getProfileTarget(req.user); // now awaited

    const log = await DailyLog.findOne({ user: req.user._id, date });
    const entries = log?.entries ?? [];
    const totals = sumEntries(entries);
    const remaining = getRemaining({ target, totals });

    res.status(200).json({
      success: true,
      data: { date, target, entries, totals, remaining },
    });
  } catch (err) {
    next(err);
  }
}

async function addLogEntry(req, res, next) {
  try {
    const date = resolveDate(req.body.date);
    const { fdcId, description, servingSize, servingSizeUnit, nutrients } =
      req.body;
    const quantity = req.body.quantity ?? 1;

    const entry = {
      fdcId,
      description,
      servingSize,
      servingSizeUnit,
      quantity,
      nutrients: scaleNutrients(nutrients, quantity),
    };

    const log = await DailyLog.findOneAndUpdate(
      { user: req.user._id, date },
      { $push: { entries: entry }, $setOnInsert: { user: req.user._id, date } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const target = await getProfileTarget(req.user); // now awaited
    const totals = sumEntries(log.entries);
    const remaining = getRemaining({ target, totals });

    res.status(201).json({
      success: true,
      data: { date, entries: log.entries, totals, remaining },
    });
  } catch (err) {
    next(err);
  }
}

async function updateLogEntry(req, res, next) {
  try {
    const date = resolveDate(req.body.date);
    const { entryId } = req.params;
    const quantity = Number(req.body.quantity);
    const log = await DailyLog.findOne({ user: req.user._id, date });
    if (!log) {
      return next(new AppError("No log found for that date.", 404));
    }
    const entry = log.entries.id(entryId);
    if (!entry) {
      return next(new AppError("Food entry not found.", 404));
    }
    const oldQuantity = Number(entry.quantity);
    const baseNutrients = {};
    Object.keys(entry.nutrients.toObject()).forEach((key) => {
      const value = Number(entry.nutrients[key]);
      baseNutrients[key] = Number.isFinite(value) ? value / oldQuantity : 0;
    });
    entry.quantity = quantity;
    entry.nutrients = scaleNutrients(baseNutrients, quantity);
    await log.save();
    const target = await getProfileTarget(req.user); // now awaited
    const totals = sumEntries(log.entries);
    const remaining = getRemaining({ target, totals });
    res.status(200).json({
      success: true,
      data: { date, entries: log.entries, totals, remaining },
    });
  } catch (err) {
    next(err);
  }
}

async function deleteLogEntry(req, res, next) {
  try {
    const date = resolveDate(req.query.date);
    const { entryId } = req.params;

    const log = await DailyLog.findOneAndUpdate(
      { user: req.user._id, date },
      { $pull: { entries: { _id: entryId } } },
      { new: true },
    );

    if (!log) {
      return next(new AppError("No log found for that date.", 404));
    }

    const target = await getProfileTarget(req.user); // now awaited
    const totals = sumEntries(log.entries);
    const remaining = getRemaining({ target, totals });

    res.status(200).json({
      success: true,
      data: { date, entries: log.entries, totals, remaining },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, addLogEntry, updateLogEntry, deleteLogEntry };
