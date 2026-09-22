const { searchFoods, getFoodDetails } = require("../services/foodService");
const cache = require("../utils/cache");

const SEARCH_TTL_SECONDS = 600; // 10 minutes — search results change rarely
const DETAIL_TTL_SECONDS = 3600; // 1 hour — a single food's nutrients are effectively static

/**
 * GET /api/foods/search?q=...&pageSize=...&pageNumber=...
 * Public. Searches USDA FoodData Central, cached by normalized query params.
 */
async function search(req, res, next) {
  try {
    const { q, pageSize = 25, pageNumber = 1 } = req.query;

    const cacheKey = cache.buildKey("food:search", { q, pageSize, pageNumber });
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: cached,
      });
    }

    const results = await searchFoods({ query: q, pageSize, pageNumber });
    cache.set(cacheKey, results, SEARCH_TTL_SECONDS);

    res.status(200).json({
      success: true,
      cached: false,
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/foods/:fdcId
 * Public. Fetches full nutrition detail for a single food, cached by fdcId.
 */
async function getById(req, res, next) {
  try {
    const { fdcId } = req.params;

    const cacheKey = cache.buildKey("food:detail", { fdcId });
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: cached,
      });
    }

    const food = await getFoodDetails(fdcId);
    cache.set(cacheKey, food, DETAIL_TTL_SECONDS);

    res.status(200).json({
      success: true,
      cached: false,
      data: food,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { search, getById };
