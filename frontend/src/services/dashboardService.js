import api from "./api";

/**
 * GET /api/dashboard/today
 * @returns {Promise<{date:string, target:object, entries:array, totals:object, remaining:object}>}
 */
export async function fetchDashboard(date) {
  const res = await api.get("/dashboard/today", {
    params: date ? { date } : {},
  });
  return res.data.data;
}

/**
 * POST /api/dashboard/log
 */
export async function logFoodEntry(entry) {
  const res = await api.post("/dashboard/log", entry);
  return res.data.data;
}


export async function updateFoodEntry(entryId, quantity, date) {
  const res = await api.patch(`/dashboard/log/${entryId}`, {
    quantity,
    ...(date ? { date } : {}),
  });

  return res.data.data;
}

/**
 * DELETE /api/dashboard/log/:entryId
 */
export async function deleteFoodEntry(entryId, date) {
  const res = await api.delete(`/dashboard/log/${entryId}`, {
    params: date ? { date } : {},
  });
  return res.data.data;
}

/**
 * GET /api/foods/search — reused here for the dashboard's "add food" panel
 * so this file is self-contained and doesn't assume the shape of the
 * existing foodService.js used by the Food Search page.
 */
export async function searchFoodsForLog(query) {
  const res = await api.get("/foods/search", {
    params: { q: query, pageSize: 10 },
  });
  return res.data.data;
}
