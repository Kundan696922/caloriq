import api from './api';

/**
 * POST /api/calculators/maintenance
 * @returns {Promise<{bmr:number, tdee:number}>}
 */
export async function fetchMaintenanceCalories(payload) {
  const res = await api.post('/calculators/maintenance', payload);
  return res.data.data;
}

/**
 * POST /api/calculators/goal
 * @returns {Promise<{bmr:number, tdee:number, calorieTarget:number, macros:object}>}
 */
export async function fetchGoalCalories(payload) {
  const res = await api.post('/calculators/goal', payload);
  return res.data.data;
}
