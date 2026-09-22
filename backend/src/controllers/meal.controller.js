const Meal = require("../models/Meal");
const DailyLog = require("../models/DailyLog");
const { AppError } = require("../middleware/errorHandler");
const { generateMeals, saveMeal } = require("../services/mealService");
const { getProfileTarget } = require("../utils/profileTarget");
const {
  scaleNutrients,
  sumEntries,
  getRemaining,
} = require("../utils/dashboardCalculations");

function resolveDate(bodyDate) {
  return bodyDate || new Date().toISOString().slice(0, 10);
}

/**
 * POST /api/meals/generate
 * Protected. Generates validated meal options. Nothing is saved.
 */
async function generate(req, res, next) {
  try {
    const data = await generateMeals({ user: req.user, params: req.body });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/meals
 * Protected. Saves a meal draft (as returned by /generate) to history.
 */
async function save(req, res, next) {
  try {
    const meal = await saveMeal(req.user, req.body);
    res.status(201).json({ success: true, data: { meal } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/meals?page=1&limit=12&mealType=dinner&favorite=true
 * Protected. Paginated history of saved meals, newest first.
 */
async function list(req, res, next) {
  try {
    const page = req.query.page ?? 1;
    const limit = req.query.limit ?? 12;

    const filter = { user: req.user._id };
    if (req.query.mealType) filter.mealType = req.query.mealType;
    if (req.query.favorite === true) filter.isFavorite = true;

    const [meals, total] = await Promise.all([
      Meal.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Meal.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        meals,
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/meals/:id
 */
async function getOne(req, res, next) {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();
    if (!meal) return next(new AppError("Meal not found.", 404));

    res.status(200).json({ success: true, data: { meal } });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/meals/:id/favorite
 * Body { isFavorite: boolean } sets the flag; omit the body to toggle.
 */
async function toggleFavorite(req, res, next) {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });
    if (!meal) return next(new AppError("Meal not found.", 404));

    meal.isFavorite =
      typeof req.body.isFavorite === "boolean"
        ? req.body.isFavorite
        : !meal.isFavorite;
    await meal.save();

    res.status(200).json({ success: true, data: { meal } });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/meals/:id
 */
async function remove(req, res, next) {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!meal) return next(new AppError("Meal not found.", 404));

    res.status(200).json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/meals/:id/log
 * Body { date?: 'YYYY-MM-DD', quantity?: number }
 * Protected. Adds the saved meal to a day's dashboard log. Response shape
 * matches the dashboard endpoints so the frontend can reuse its state update.
 *
 * The entry's fdcId is "ai:<mealId>" because DailyLog requires an fdcId and
 * AI meals have no USDA id.
 */
async function logMeal(req, res, next) {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();
    if (!meal) return next(new AppError("Meal not found.", 404));

    const date = resolveDate(req.body.date);
    const quantity = req.body.quantity ?? 1;

    const entry = {
      fdcId: `ai:${meal._id}`,
      description: meal.title,
      servingSize: 1,
      servingSizeUnit: "serving",
      quantity,
      nutrients: scaleNutrients(meal.nutrients, quantity),
    };

    const log = await DailyLog.findOneAndUpdate(
      { user: req.user._id, date },
      { $push: { entries: entry }, $setOnInsert: { user: req.user._id, date } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const target = getProfileTarget(req.user);
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

module.exports = {
  generate,
  save,
  list,
  getOne,
  toggleFavorite,
  remove,
  logMeal,
};
