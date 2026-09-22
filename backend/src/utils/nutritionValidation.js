/**
 * Nutrition validation for AI-generated meals (Phase 7).
 *
 * Principle: the server is the source of truth. Whatever the AI (or the
 * client, when saving) claims, meal totals are RECOMPUTED here from the
 * ingredient list, and every number is range-checked.
 */

const { AppError } = require("../middleware/errorHandler");
const {
  NUTRIENT_KEYS,
  scaleNutrients,
  sumEntries,
} = require("./dashboardCalculations");
const {
  MEAL_TYPES,
  DIETARY_PREFERENCES,
  FIT_TO_OPTIONS,
  INGREDIENT_SOURCES,
  CALORIE_TOLERANCE,
  LIMITS,
} = require("./mealConstants");

const CORE_KEYS = ["calories", "protein", "fat", "carbs"];

// Physical upper bounds per 100 g of any food (pure fat is ~884 kcal; salt is
// ~38,800 mg sodium). Anything above these is a hallucination.
const PER_100G_LIMITS = {
  calories: 950,
  protein: 100,
  fat: 100,
  carbs: 100,
  fiber: 100,
  sugars: 100,
  sodium: 40000,
};

// ---------- small helpers ----------

/** Strips control chars and angle brackets, collapses whitespace, caps length. */
function cleanText(value, maxLen) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function toFiniteNumber(value) {
  const n =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

const round1 = (n) => Math.round(n * 10) / 10;

function readMinutes(value) {
  const n = toFiniteNumber(value);
  if (n === null || n < 0) return 0;
  return Math.min(Math.round(n), 480);
}

/**
 * Reads + range-checks a nutrient object.
 * @param factor 1 for per-100g values, grams/100 for values already scaled to a weight
 */
function readNutrients(raw, factor, { requireCore }) {
  if (!raw || typeof raw !== "object") {
    return { error: "nutrition data is missing" };
  }

  const out = {};
  for (const key of NUTRIENT_KEYS) {
    const n = toFiniteNumber(raw[key]);
    if (n === null) {
      if (requireCore && CORE_KEYS.includes(key)) {
        return { error: `${key} is missing or not a number` };
      }
      out[key] = 0;
      continue;
    }
    if (n < 0) return { error: `${key} is negative` };
    if (n > PER_100G_LIMITS[key] * factor * 1.02 + 0.1) {
      return { error: `${key} is implausibly high` };
    }
    out[key] = n;
  }

  if (out.protein + out.fat + out.carbs > 105 * factor + 0.5) {
    return { error: "macros weigh more than the ingredient itself" };
  }

  return { value: out };
}

/**
 * Atwater energy estimate with fibre handled (~2 kcal/g instead of 4).
 */
function atwaterCalories({ protein = 0, fat = 0, carbs = 0, fiber = 0 }) {
  const fibre = Math.min(fiber, carbs);
  return 4 * protein + 4 * (carbs - fibre) + 2 * fibre + 9 * fat;
}

/**
 * If an AI-estimated per-100g row is internally inconsistent (calories far from
 * what its own macros add up to), recompute calories from the macros.
 */
function reconcileCaloriesFromMacros(per100g) {
  const expected = atwaterCalories(per100g);
  const diff = Math.abs(per100g.calories - expected);
  if (diff > 10 && expected > 0 && diff / expected > 0.15) {
    return {
      per100g: { ...per100g, calories: round1(expected) },
      adjusted: true,
    };
  }
  return { per100g, adjusted: false };
}

// ---------- AI output -> internal meal ----------

/**
 * Validates and sanitizes one meal object returned by the AI.
 * Returns { title, errors, meal } — `meal` is null when errors exist.
 * Ingredient nutrition here is still PER 100 g.
 */
function parseAiMeal(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      title: "(untitled)",
      errors: ["not a valid meal object"],
      meal: null,
    };
  }

  const errors = [];
  const title = cleanText(raw.title, LIMITS.titleMax);
  if (!title) errors.push("missing title");

  const rawIngredients = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  if (rawIngredients.length < 1) errors.push("no ingredients");
  if (rawIngredients.length > LIMITS.maxIngredients) {
    errors.push(`more than ${LIMITS.maxIngredients} ingredients`);
  }

  const ingredients = [];
  rawIngredients.slice(0, LIMITS.maxIngredients).forEach((ing, index) => {
    const name = cleanText(ing?.name, LIMITS.ingredientNameMax);
    if (!name) {
      errors.push(`ingredient ${index + 1} has no name`);
      return;
    }

    const grams = toFiniteNumber(ing.grams);
    if (grams === null || grams < 0.1 || grams > LIMITS.maxIngredientGrams) {
      errors.push(`"${name}" has an invalid weight`);
      return;
    }

    const nutrition = readNutrients(ing.per100g, 1, { requireCore: true });
    if (nutrition.error) {
      errors.push(`"${name}": ${nutrition.error}`);
      return;
    }

    let displayQuantity = toFiniteNumber(ing.displayQuantity);
    let displayUnit = cleanText(ing.displayUnit, 20);
    if (!(displayQuantity > 0 && displayQuantity <= 10000) || !displayUnit) {
      displayQuantity = round1(grams);
      displayUnit = "g";
    }

    ingredients.push({
      name,
      searchTerm:
        cleanText(ing.searchTerm, LIMITS.searchTermMax) || name.toLowerCase(),
      grams: round1(grams),
      displayQuantity: round1(displayQuantity),
      displayUnit,
      per100g: nutrition.value,
    });
  });

  const instructions = (Array.isArray(raw.instructions) ? raw.instructions : [])
    .map((step) => cleanText(step, LIMITS.instructionMax))
    .filter(Boolean)
    .slice(0, LIMITS.maxInstructions);
  if (instructions.length === 0) errors.push("no instructions");

  if (errors.length > 0) {
    return { title: title || "(untitled)", errors, meal: null };
  }

  return {
    title,
    errors,
    meal: {
      title,
      description: cleanText(raw.description, LIMITS.descriptionMax),
      prepTimeMinutes: readMinutes(raw.prepTimeMinutes),
      cookTimeMinutes: readMinutes(raw.cookTimeMinutes),
      ingredients,
      instructions,
    },
  };
}

// ---------- totals + validation summary ----------

/**
 * Recomputes per-serving totals from the ingredients and builds the
 * validation summary (verification share, warnings, target fit).
 *
 * @param ingredients [{ nutrients, source }] with nutrients already scaled to grams
 * @param targets optional { calories, protein } for the target-fit check
 * @returns { nutrients, validation, offTarget }
 */
function finalizeNutrition({ ingredients, targets, extraWarnings = [] }) {
  const totals = sumEntries(ingredients);
  totals.calories = Math.round(totals.calories);

  const warnings = [...extraWarnings];

  // How much of the meal's energy comes from USDA-matched ingredients?
  const usdaCalories = ingredients
    .filter((i) => i.source === "usda")
    .reduce((sum, i) => sum + (i.nutrients?.calories || 0), 0);
  const verifiedCalorieShare =
    totals.calories > 0
      ? Math.min(100, Math.round((usdaCalories / totals.calories) * 100))
      : 0;
  const status =
    verifiedCalorieShare >= 80
      ? "verified"
      : verifiedCalorieShare >= 40
        ? "partial"
        : "estimated";

  // Meal-level Atwater sanity check (warning only; ingredient rows were already reconciled).
  const expected = atwaterCalories(totals);
  const diff = Math.abs(totals.calories - expected);
  if (expected > 0 && diff > 40 && diff / expected > 0.15) {
    warnings.push(
      `Listed calories (${totals.calories}) differ from what the macros add up to (about ${Math.round(expected)}).`,
    );
  }

  // Target fit
  let offTarget = false;
  if (targets?.calories > 0) {
    const deviation = (totals.calories - targets.calories) / targets.calories;
    if (Math.abs(deviation) > CALORIE_TOLERANCE) {
      offTarget = true;
      warnings.push(
        `Calories (${totals.calories}) are about ${Math.round(Math.abs(deviation) * 100)}% ${deviation > 0 ? "above" : "below"} the ${targets.calories} kcal target.`,
      );
    }
  }
  if (targets?.protein > 0 && totals.protein < targets.protein * 0.75) {
    warnings.push(
      `Protein (${Math.round(totals.protein)} g) is below the roughly ${targets.protein} g target.`,
    );
  }

  return {
    nutrients: totals,
    validation: { status, warnings, verifiedCalorieShare },
    offTarget,
  };
}

// ---------- client payload (save) -> validated draft ----------

function fail(message) {
  throw new AppError(message, 400);
}

function readTarget(value) {
  const n = toFiniteNumber(value);
  return n !== null && n >= 0 && n <= 10000 ? Math.round(n) : undefined;
}

/**
 * Deep-validates a meal sent by the client for saving. Anything suspicious
 * throws a 400. Totals/validation are NOT trusted from the client; the caller
 * recomputes them with finalizeNutrition().
 */
function parseMealDraft(body) {
  if (!body || typeof body !== "object") fail("Meal data is required.");

  const title = cleanText(body.title, LIMITS.titleMax);
  if (!title) fail("Meal title is required.");

  if (!MEAL_TYPES.includes(body.mealType)) fail("Invalid meal type.");

  if (
    !Array.isArray(body.ingredients) ||
    body.ingredients.length < 1 ||
    body.ingredients.length > LIMITS.maxIngredients
  ) {
    fail(`A meal needs 1 to ${LIMITS.maxIngredients} ingredients.`);
  }

  const ingredients = body.ingredients.map((ing, index) => {
    const name = cleanText(ing?.name, LIMITS.ingredientNameMax);
    if (!name) fail(`Ingredient ${index + 1} has no name.`);

    const grams = toFiniteNumber(ing.grams);
    if (grams === null || grams < 0.1 || grams > LIMITS.maxIngredientGrams) {
      fail(`Ingredient "${name}" has an invalid weight.`);
    }

    const nutrition = readNutrients(ing.nutrients, grams / 100, {
      requireCore: true,
    });
    if (nutrition.error) fail(`Ingredient "${name}": ${nutrition.error}.`);

    let source = INGREDIENT_SOURCES.includes(ing.source)
      ? ing.source
      : "ai_estimate";
    const fdcId =
      source === "usda" && /^\d{1,12}$/.test(String(ing.fdcId ?? ""))
        ? String(ing.fdcId)
        : undefined;
    if (source === "usda" && !fdcId) source = "ai_estimate";

    const displayQuantity = toFiniteNumber(ing.displayQuantity);
    const displayUnit = cleanText(ing.displayUnit, 30);
    const hasDisplay =
      displayQuantity > 0 && displayQuantity <= 10000 && displayUnit;

    return {
      name,
      searchTerm: cleanText(ing.searchTerm, LIMITS.searchTermMax) || undefined,
      grams: round1(grams),
      displayQuantity: hasDisplay ? round1(displayQuantity) : round1(grams),
      displayUnit: hasDisplay ? displayUnit : "g",
      nutrients: nutrition.value,
      source,
      fdcId,
      usdaDescription:
        source === "usda"
          ? cleanText(ing.usdaDescription, 200) || undefined
          : undefined,
    };
  });

  const instructions = (
    Array.isArray(body.instructions) ? body.instructions : []
  )
    .map((step) => cleanText(step, LIMITS.instructionMax))
    .filter(Boolean)
    .slice(0, LIMITS.maxInstructions);
  if (instructions.length === 0) fail("A meal needs at least one instruction.");

  const gp =
    body.generationParams && typeof body.generationParams === "object"
      ? body.generationParams
      : {};

  const generationParams = {
    fitTo: FIT_TO_OPTIONS.includes(gp.fitTo) ? gp.fitTo : undefined,
    cuisine: cleanText(gp.cuisine, 50) || undefined,
    maxPrepMinutes: readTarget(gp.maxPrepMinutes),
    dietaryPreferences: (Array.isArray(gp.dietaryPreferences)
      ? gp.dietaryPreferences
      : []
    )
      .filter((p) => DIETARY_PREFERENCES.includes(p))
      .slice(0, 6),
    allergies: (Array.isArray(gp.allergies) ? gp.allergies : [])
      .map((a) => cleanText(a, 40))
      .filter(Boolean)
      .slice(0, 10),
    targetCalories: readTarget(gp.targetCalories),
    targetProtein: readTarget(gp.targetProtein),
    targetFat: readTarget(gp.targetFat),
    targetCarbs: readTarget(gp.targetCarbs),
  };

  return {
    title,
    description: cleanText(body.description, LIMITS.descriptionMax),
    mealType: body.mealType,
    servings: 1,
    prepTimeMinutes: readMinutes(body.prepTimeMinutes),
    cookTimeMinutes: readMinutes(body.cookTimeMinutes),
    ingredients,
    instructions,
    generationParams,
    aiModel: cleanText(body.aiModel, 60) || "unknown",
  };
}

module.exports = {
  cleanText,
  scaleNutrients,
  atwaterCalories,
  reconcileCaloriesFromMacros,
  parseAiMeal,
  finalizeNutrition,
  parseMealDraft,
};
