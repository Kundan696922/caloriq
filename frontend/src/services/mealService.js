import api from "./api";

/**
 * POST /api/meals/generate
 * Returns { meals, targets, fitTo, date }. Nothing is saved server-side.
 * Generation calls an AI model and a USDA cross-check, so allow a long timeout.
 */
export async function generateMeals(params) {
  const res = await api.post("/meals/generate", params, { timeout: 90000 });
  return res.data.data;
}

/**
 * POST /api/meals — saves a generated draft. Returns the saved meal.
 */
export async function saveMeal(meal) {
  const res = await api.post("/meals", meal);
  return res.data.data.meal;
}

/**
 * GET /api/meals — paginated history.
 * @returns {Promise<{meals:array, page:number, limit:number, total:number, totalPages:number}>}
 */
export async function fetchMeals({
  page = 1,
  limit = 6,
  mealType,
  favorite,
} = {}) {
  const params = { page, limit };
  if (mealType) params.mealType = mealType;
  if (favorite) params.favorite = true;

  const res = await api.get("/meals", { params });
  return res.data.data;
}

/**
 * PATCH /api/meals/:id/favorite
 */
export async function setMealFavorite(id, isFavorite) {
  const res = await api.patch(`/meals/${id}/favorite`, { isFavorite });
  return res.data.data.meal;
}

/**
 * DELETE /api/meals/:id
 */
export async function deleteMeal(id) {
  const res = await api.delete(`/meals/${id}`);
  return res.data.data;
}

/**
 * POST /api/meals/:id/log — adds a saved meal to a day's dashboard log.
 * Returns the same { date, entries, totals, remaining } shape as the dashboard.
 */
export async function logMealToDashboard(id, { date, quantity } = {}) {
  const res = await api.post(`/meals/${id}/log`, {
    ...(date ? { date } : {}),
    ...(quantity ? { quantity } : {}),
  });
  return res.data.data;
}
