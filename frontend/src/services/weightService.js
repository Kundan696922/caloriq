import api from "./api";

/**
 * POST /api/weight
 * Logs (or upserts) today's — or a given date's — weight entry.
 */
export async function addWeightEntry({ weightKg, date, note }) {
  const res = await api.post("/weight", { weightKg, date, note });
  return res.data.data; // { entry }
}

/**
 * GET /api/weight/history?startDate=&endDate=
 */
export async function getWeightHistory(params = {}) {
  const res = await api.get("/weight/history", { params });
  return res.data.data; // { entries }
}

/**
 * GET /api/weight/stats
 */
export async function getWeightStats() {
  const res = await api.get("/weight/stats");
  return res.data.data; // { latest, totalEntries, chart, changes, goalProgress }
}

/**
 * DELETE /api/weight/:entryId
 */
export async function deleteWeightEntry(entryId) {
  const res = await api.delete(`/weight/${entryId}`);
  return res.data.data; // { entry }
}
