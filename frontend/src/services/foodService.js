import api from "./api";

/**
 * GET /api/foods/search?q=...&pageSize=...&pageNumber=...
 * @param {{ q: string, pageSize?: number, pageNumber?: number }} params
 * @returns {Promise<{
 *   query: string,
 *   totalHits: number,
 *   pageSize: number,
 *   pageNumber: number,
 *   totalPages: number,
 *   foods: Array<{
 *     fdcId: number,
 *     description: string,
 *     dataType: string,
 *     servingSize: number|null,
 *     servingSizeUnit: string|null,
 *     nutrients: { calories:number|null, protein:number|null, fat:number|null, carbs:number|null, fiber:number|null, sugars:number|null, sodium:number|null }
 *   }>
 * }>}
 */
export async function searchFoods({ q, pageSize = 25, pageNumber = 1 }) {
  const res = await api.get("/foods/search", {
    params: { q, pageSize, pageNumber },
  });
  return res.data.data;
}

/**
 * GET /api/foods/:fdcId
 * @param {number|string} fdcId
 * @returns {Promise<{
 *   fdcId: number,
 *   description: string,
 *   dataType: string,
 *   servingSize: number|null,
 *   servingSizeUnit: string|null,
 *   nutrients: { calories:number|null, protein:number|null, fat:number|null, carbs:number|null, fiber:number|null, sugars:number|null, sodium:number|null }
 * }>}
 */
export async function fetchFoodById(fdcId) {
  const res = await api.get(`/foods/${fdcId}`);
  return res.data.data;
}
