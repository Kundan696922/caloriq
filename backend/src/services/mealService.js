const DailyLog = require("../models/DailyLog");
const Meal = require("../models/Meal");
const { AppError } = require("../middleware/errorHandler");
const cache = require("../utils/cache");
const { searchFoods } = require("./foodService");
const { generateJson } = require("./aiService");
const { getProfileTarget } = require("../utils/profileTarget");
const {
  sumEntries,
  getRemaining,
  scaleNutrients,
} = require("../utils/dashboardCalculations");
const {
  MEAL_TYPES,
  FIT_TO_OPTIONS,
  DIETARY_PREFERENCES,
  MEAL_SHARES,
  MAX_SINGLE_MEAL_SHARE,
  MIN_REMAINING_CALORIES,
  LIMITS,
} = require("../utils/mealConstants");
const { buildDietaryRules, checkMeal } = require("../utils/dietaryGuard");
const {
  cleanText,
  reconcileCaloriesFromMacros,
  parseAiMeal,
  finalizeNutrition,
  parseMealDraft,
} = require("../utils/nutritionValidation");
const {
  MEAL_RESPONSE_SCHEMA,
  buildSystemPrompt,
  buildUserPrompt,
} = require("../utils/mealPrompts");

const MAX_ATTEMPTS = 2; // first try + one corrective retry
const USDA_LOOKUP_TTL_SECONDS = 3600;
const USDA_CONCURRENCY = 5;
const MIN_MEAL_CALORIES = 30;

// ---------- request normalization ----------

function todayString() {
  // Same convention as dashboard.controller: the client should send ?date.
  return new Date().toISOString().slice(0, 10);
}

function cleanList(value, maxItems, maxLen) {
  if (!Array.isArray(value)) return [];
  const cleaned = value
    .map((v) => cleanText(v, maxLen).toLowerCase())
    .filter((v) => v.length >= 2);
  return [...new Set(cleaned)].slice(0, maxItems);
}

function normalizeParams(params = {}) {
  if (!MEAL_TYPES.includes(params.mealType)) {
    throw new AppError("Invalid meal type.", 400);
  }

  const count = Math.min(Math.max(parseInt(params.count, 10) || 2, 1), 3);
  const maxPrep = parseInt(params.maxPrepMinutes, 10);

  return {
    mealType: params.mealType,
    count,
    fitTo: FIT_TO_OPTIONS.includes(params.fitTo) ? params.fitTo : "meal_share",
    date: /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? "")
      ? params.date
      : todayString(),
    dietaryPreferences: (Array.isArray(params.dietaryPreferences)
      ? params.dietaryPreferences
      : []
    )
      .filter((p) => DIETARY_PREFERENCES.includes(p))
      .slice(0, 6),
    allergies: cleanList(params.allergies, 10, 40),
    excludedFoods: cleanList(params.excludedFoods, 10, 40),
    cuisine: cleanText(params.cuisine, 50),
    maxPrepMinutes:
      Number.isFinite(maxPrep) && maxPrep >= 5 && maxPrep <= 240
        ? maxPrep
        : undefined,
    notes: cleanText(params.notes, 300),
  };
}

// ---------- targets ----------

/**
 * Calorie/macro target for ONE meal.
 *  - meal_share: the meal type's default share of the daily target.
 *  - remaining_today: what's left today, capped so a single meal can't take
 *    the whole remaining budget. Macro proportions follow the remaining macros
 *    when they're all still positive, otherwise the daily-target proportions.
 */
function computeMealTargets({ target, mealType, fitTo, remaining }) {
  const daily = {
    calories: target.calorieTarget,
    protein: target.macros.protein.grams,
    fat: target.macros.fat.grams,
    carbs: target.macros.carbs.grams,
  };

  let calories;
  let base = daily;

  if (fitTo === "remaining_today") {
    if (remaining.calories < MIN_REMAINING_CALORIES) {
      throw new AppError(
        "You've almost reached today's calorie target, so there's not enough left for another meal. Try a different date or the 'share of daily target' option.",
        400,
      );
    }
    const cap = daily.calories * MAX_SINGLE_MEAL_SHARE[mealType];
    calories = Math.min(remaining.calories, cap);
    if (remaining.protein > 0 && remaining.fat > 0 && remaining.carbs > 0) {
      base = remaining;
    }
  } else {
    calories = daily.calories * MEAL_SHARES[mealType];
  }

  // Scale the macro proportions so 4P + 4C + 9F equals the calorie target.
  const baseKcal = 4 * base.protein + 4 * base.carbs + 9 * base.fat;
  const factor = baseKcal > 0 ? calories / baseKcal : 0;

  return {
    calories: Math.round(calories),
    protein: Math.round(base.protein * factor),
    carbs: Math.round(base.carbs * factor),
    fat: Math.round(base.fat * factor),
  };
}

async function getRemainingForDate(user, target, date) {
  const log = await DailyLog.findOne({ user: user._id, date }).lean();
  return getRemaining({ target, totals: sumEntries(log?.entries ?? []) });
}

// ---------- USDA cross-check ----------

/** Tiny concurrency limiter so a 3-meal request doesn't fire 60 USDA calls at once. */
function createLimiter(max) {
  let active = 0;
  const queue = [];

  const next = () => {
    if (active >= max || queue.length === 0) return;
    active += 1;
    const { fn, resolve, reject } = queue.shift();
    fn()
      .then(resolve, reject)
      .finally(() => {
        active -= 1;
        next();
      });
  };

  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
}

/**
 * Is a USDA result plausibly the SAME food/form the AI described?
 * This catches the classic wrong-match (e.g. USDA's "rice, white, raw" at
 * 365 kcal/100 g vs the AI's cooked rice at 130). Values must agree within a
 * factor of 1.6, or within 15 kcal for very low-energy foods.
 */
function isPlausibleMatch(usda, ai) {
  if (!usda) return false;
  const core = ["calories", "protein", "fat", "carbs"];
  if (core.some((k) => typeof usda[k] !== "number")) return false;

  if (Math.abs(usda.calories - ai.calories) <= 15) return true;
  if (ai.calories <= 0 || usda.calories <= 0) return false;

  const ratio = usda.calories / ai.calories;
  return ratio >= 1 / 1.6 && ratio <= 1.6;
}

async function findUsdaMatch(searchTerm, aiPer100g) {
  const query = searchTerm.trim();
  if (query.length < 2) return null;

  const key = cache.buildKey("meal:usda", { q: query });
  let results = cache.get(key);
  if (!results) {
    results = await searchFoods({ query, pageSize: 5, pageNumber: 1 });
    cache.set(key, results, USDA_LOOKUP_TTL_SECONDS);
  }

  return (
    results.foods.find((food) => isPlausibleMatch(food.nutrients, aiPer100g)) ||
    null
  );
}

/**
 * Turns one AI ingredient (per-100g values) into a stored ingredient (values
 * scaled to its grams), preferring verified USDA values over the AI's.
 */
async function resolveIngredient(ing, ctx) {
  let per100g = ing.per100g;
  let source = "ai_estimate";
  let fdcId;
  let usdaDescription;
  let adjusted = false;

  if (!ctx.usdaDown) {
    try {
      const match = await findUsdaMatch(ing.searchTerm, ing.per100g);
      if (match) {
        const u = match.nutrients;
        per100g = {
          calories: u.calories,
          protein: u.protein,
          fat: u.fat,
          carbs: u.carbs,
          // USDA often omits these; fall back to the AI's figure per field.
          fiber: u.fiber ?? ing.per100g.fiber,
          sugars: u.sugars ?? ing.per100g.sugars,
          sodium: u.sodium ?? ing.per100g.sodium,
        };
        source = "usda";
        fdcId = String(match.fdcId);
        usdaDescription = cleanText(match.description, 200);
      }
    } catch (err) {
      // Any upstream failure (rate limit, outage, missing key) disables the
      // cross-check for the rest of this request; the meal degrades to
      // "ai_estimate" instead of failing.
      ctx.usdaDown = true;
    }
  }

  if (source === "ai_estimate") {
    const reconciled = reconcileCaloriesFromMacros(per100g);
    per100g = reconciled.per100g;
    adjusted = reconciled.adjusted;
  }

  return {
    name: ing.name,
    searchTerm: ing.searchTerm,
    grams: ing.grams,
    displayQuantity: ing.displayQuantity,
    displayUnit: ing.displayUnit,
    nutrients: scaleNutrients(per100g, ing.grams / 100),
    source,
    fdcId,
    usdaDescription,
    adjusted, // internal flag, stripped before returning
  };
}

// ---------- one AI candidate -> validated meal ----------

async function processCandidate(raw, { rules, targets, params, ctx, limit }) {
  const parsed = parseAiMeal(raw);
  if (!parsed.meal) {
    return {
      rejected: `"${parsed.title}" had invalid data (${parsed.errors[0]}).`,
    };
  }

  const violations = checkMeal(parsed.meal, rules);
  if (violations.length > 0) {
    return {
      rejected: `"${parsed.title}" conflicts with the person's restrictions (${violations.join(", ")}). Do not use those ingredients.`,
    };
  }

  const ingredients = await Promise.all(
    parsed.meal.ingredients.map((ing) =>
      limit(() => resolveIngredient(ing, ctx)),
    ),
  );

  const extraWarnings = [];
  const adjustedNames = ingredients
    .filter((i) => i.adjusted)
    .map((i) => i.name);
  if (adjustedNames.length > 0) {
    extraWarnings.push(
      `Calories for ${adjustedNames.join(", ")} were recalculated from their macros.`,
    );
  }
  if (
    params.maxPrepMinutes &&
    parsed.meal.prepTimeMinutes + parsed.meal.cookTimeMinutes >
      params.maxPrepMinutes * 1.25
  ) {
    extraWarnings.push(
      `This meal may take longer than your ${params.maxPrepMinutes} minute limit.`,
    );
  }

  const { nutrients, validation, offTarget } = finalizeNutrition({
    ingredients,
    targets,
    extraWarnings,
  });

  if (nutrients.calories < MIN_MEAL_CALORIES) {
    return { rejected: `"${parsed.title}" had implausibly low calories.` };
  }

  return {
    offTarget,
    deviation: Math.abs(nutrients.calories - targets.calories),
    meal: {
      title: parsed.meal.title,
      description: parsed.meal.description,
      mealType: params.mealType,
      servings: 1,
      prepTimeMinutes: parsed.meal.prepTimeMinutes,
      cookTimeMinutes: parsed.meal.cookTimeMinutes,
      ingredients: ingredients.map(({ adjusted, ...rest }) => rest),
      instructions: parsed.meal.instructions,
      nutrients,
      validation,
      generationParams: {
        fitTo: params.fitTo,
        cuisine: params.cuisine || undefined,
        maxPrepMinutes: params.maxPrepMinutes,
        dietaryPreferences: params.dietaryPreferences,
        allergies: params.allergies,
        targetCalories: targets.calories,
        targetProtein: targets.protein,
        targetFat: targets.fat,
        targetCarbs: targets.carbs,
      },
    },
  };
}

// ---------- public: generate ----------

/**
 * Generates up to `count` validated meal drafts. NOTHING is saved.
 * The returned drafts are exactly what POST /api/meals accepts for saving.
 */
async function generateMeals({ user, params: rawParams }) {
  const params = normalizeParams(rawParams);
  const target = getProfileTarget(user);

  const remaining =
    params.fitTo === "remaining_today"
      ? await getRemainingForDate(user, target, params.date)
      : null;

  const targets = computeMealTargets({
    target,
    mealType: params.mealType,
    fitTo: params.fitTo,
    remaining,
  });

  const rules = buildDietaryRules(params);
  const ctx = { usdaDown: false };
  const limit = createLimiter(USDA_CONCURRENCY);
  const systemPrompt = buildSystemPrompt();

  const good = [];
  const offTarget = [];
  const seenTitles = new Set();
  let feedback = [];
  let modelUsed = "unknown";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let aiResult;
    try {
      aiResult = await generateJson({
        systemPrompt,
        userPrompt: buildUserPrompt({
          mealType: params.mealType,
          count: params.count,
          targets,
          goal: user.profile.goal,
          preferences: params,
          feedback,
        }),
        responseSchema: MEAL_RESPONSE_SCHEMA,
      });
    } catch (err) {
      if (good.length + offTarget.length > 0) break; // keep what we already have
      if (err.retryable && attempt < MAX_ATTEMPTS) continue;
      throw err;
    }

    modelUsed = aiResult.model;
    const rawMeals = Array.isArray(aiResult.data?.meals)
      ? aiResult.data.meals.slice(0, params.count)
      : [];

    const outcomes = await Promise.all(
      rawMeals.map((raw) =>
        processCandidate(raw, { rules, targets, params, ctx, limit }),
      ),
    );

    feedback = [];
    outcomes.forEach((outcome) => {
      if (outcome.rejected) {
        feedback.push(outcome.rejected);
        return;
      }

      const titleKey = outcome.meal.title.toLowerCase();
      if (seenTitles.has(titleKey)) return;
      seenTitles.add(titleKey);

      if (outcome.offTarget) {
        offTarget.push(outcome);
        feedback.push(
          `"${outcome.meal.title}" had ${outcome.meal.nutrients.calories} kcal but the target is ${targets.calories} kcal (allowed +/-15%).`,
        );
      } else {
        good.push(outcome);
      }
    });

    if (good.length >= params.count) break;
  }

  // Closest-to-target first among the off-target fallbacks.
  offTarget.sort((a, b) => a.deviation - b.deviation);

  const meals = [...good, ...offTarget]
    .slice(0, params.count)
    .map(({ meal }) => {
      if (ctx.usdaDown && meal.ingredients.some((i) => i.source !== "usda")) {
        meal.validation.warnings.push(
          "USDA verification was unavailable, so some values are AI estimates.",
        );
      }
      return { ...meal, aiModel: cleanText(modelUsed, 60) };
    });

  if (meals.length === 0) {
    throw new AppError(
      "We couldn't generate a valid meal that matches your preferences. Try again, or relax some filters.",
      422,
    );
  }

  return { meals, targets, fitTo: params.fitTo, date: params.date };
}

// ---------- public: save ----------

/**
 * Saves a meal draft. The client's totals and validation block are ignored;
 * they are recomputed from the (range-checked) ingredient list.
 */
async function saveMeal(user, body) {
  const savedCount = await Meal.countDocuments({ user: user._id });
  if (savedCount >= LIMITS.maxSavedMeals) {
    throw new AppError(
      `You've reached the limit of ${LIMITS.maxSavedMeals} saved meals. Delete some to save more.`,
      400,
    );
  }

  const draft = parseMealDraft(body);
  const gp = draft.generationParams;

  const { nutrients, validation } = finalizeNutrition({
    ingredients: draft.ingredients,
    targets: { calories: gp.targetCalories, protein: gp.targetProtein },
  });

  return Meal.create({ user: user._id, ...draft, nutrients, validation });
}

module.exports = { generateMeals, saveMeal };
