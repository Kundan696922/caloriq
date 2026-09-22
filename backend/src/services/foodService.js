const { AppError } = require("../middleware/errorHandler");

const FDC_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

// Nutrient IDs we care about from USDA's foodNutrients array (Foundation / SR Legacy shape).
// Full reference: https://fdc.nal.usda.gov/portal-data/external/nutrientList
const NUTRIENT_IDS = {
  calories: 1008, // Energy (kcal)
  protein: 1003,
  fat: 1004,
  carbs: 1005,
  fiber: 1079,
  sugars: 2000,
  sodium: 1093,
};

// Branded foods instead expose a flatter `labelNutrients` object.
const LABEL_NUTRIENT_MAP = {
  calories: "calories",
  protein: "protein",
  fat: "fat",
  carbs: "carbohydrates",
  fiber: "fiber",
  sugars: "sugars",
  sodium: "sodium",
};

function getApiKey() {
  const apiKey = process.env.NUTRITION_API_KEY;
  if (!apiKey || apiKey === "your_nutrition_api_key") {
    throw new AppError(
      "Nutrition API is not configured. Set NUTRITION_API_KEY in your .env file.",
      500,
    );
  }
  return apiKey;
}

/**
 * Performs a GET request against the FDC API and normalizes network/HTTP
 * failures into AppError so the controller can just let them bubble to
 * the centralized error handler.
 */
async function fdcGet(path, searchParams = {}) {
  const apiKey = getApiKey();
  const url = new URL(`${FDC_BASE_URL}${path}`);
  url.searchParams.set("api_key", apiKey);
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  let response;
  try {
    response = await fetch(url.toString());
  } catch (err) {
    throw new AppError(
      "Could not reach the nutrition data provider. Please try again.",
      502,
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new AppError(
      "Nutrition API rejected the request (invalid or missing API key).",
      502,
    );
  }

  if (response.status === 404) {
    throw new AppError("Food not found.", 404);
  }

  if (response.status === 429) {
    throw new AppError(
      "Nutrition data provider rate limit exceeded. Please try again shortly.",
      429,
    );
  }

  if (!response.ok) {
    throw new AppError(
      "Nutrition data provider returned an unexpected error.",
      502,
    );
  }

  try {
    return await response.json();
  } catch (err) {
    throw new AppError(
      "Received an invalid response from the nutrition data provider.",
      502,
    );
  }
}

/**
 * Pulls a small, consistent macro/nutrient summary out of a food record,
 * regardless of whether it came from the search endpoint (foodNutrients[])
 * or a Branded food's flatter labelNutrients object.
 */
function extractNutrients(food) {
  const result = {
    calories: null,
    protein: null,
    fat: null,
    carbs: null,
    fiber: null,
    sugars: null,
    sodium: null,
  };

  if (Array.isArray(food.foodNutrients) && food.foodNutrients.length > 0) {
    const idToKey = Object.fromEntries(
      Object.entries(NUTRIENT_IDS).map(([key, id]) => [id, key]),
    );

    food.foodNutrients.forEach((entry) => {
      // Search results use `nutrientId` / `value`; full food details use `nutrient.id` / `amount`.
      const nutrientId = entry.nutrientId ?? entry.nutrient?.id;
      const value = entry.value ?? entry.amount;
      const key = idToKey[nutrientId];
      if (key && typeof value === "number") {
        result[key] = Math.round(value * 10) / 10;
      }
    });
  }

  if (food.labelNutrients) {
    Object.entries(LABEL_NUTRIENT_MAP).forEach(([key, labelKey]) => {
      const value = food.labelNutrients[labelKey]?.value;
      if (result[key] === null && typeof value === "number") {
        result[key] = Math.round(value * 10) / 10;
      }
    });
  }

  return result;
}

function summarizeSearchResult(food) {
  return {
    fdcId: food.fdcId,
    description: food.description,
    dataType: food.dataType,
    servingSize: food.servingSize ?? 100,
    servingSizeUnit: food.servingSizeUnit ?? "g",
    nutrients: extractNutrients(food),
  };
}

/**
 * Searches USDA FDC for foods matching a query string.
 *
 * Restricted to Foundation/SR Legacy ("generic") entries only. Branded
 * products explode a simple query like "egg" into dozens of near-duplicate
 * items (different brands, pack sizes) that aren't useful for a quick
 * lookup — generic USDA entries give a single representative result per
 * food instead.
 */
async function searchFoods({
  query: searchTerm,
  pageSize = 25,
  pageNumber = 1,
}) {
  const data = await fdcGet("/foods/search", {
    query: searchTerm,
    pageSize,
    pageNumber,
    dataType: "Foundation,SR Legacy",
  });

  const foods = Array.isArray(data.foods) ? data.foods : [];

  return {
    query: searchTerm,
    totalHits: data.totalHits ?? foods.length,
    pageSize: data.pageSize ?? pageSize,
    pageNumber: data.currentPage ?? pageNumber,
    totalPages: data.totalPages ?? 1,
    foods: foods.map(summarizeSearchResult),
  };
}

/**
 * Fetches full detail for a single food by its FDC ID.
 */
async function getFoodDetails(fdcId) {
  const food = await fdcGet(`/food/${fdcId}`);

  return {
    fdcId: food.fdcId,
    description: food.description,
    dataType: food.dataType,
    servingSize: food.servingSize ?? 100,
    servingSizeUnit: food.servingSizeUnit ?? "g",
    nutrients: extractNutrients(food),
  };
}

module.exports = { searchFoods, getFoodDetails };
