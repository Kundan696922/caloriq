const express = require('express');
const { getMaintenanceCalories, getGoalCalories } = require('../controllers/calculator.controller');
const validate = require('../middleware/validate');
const { maintenanceRules, goalRules } = require('../utils/calculatorValidation');

const router = express.Router();

// POST /api/calculators/maintenance
router.post('/maintenance', maintenanceRules, validate, getMaintenanceCalories);

// POST /api/calculators/goal
router.post('/goal', goalRules, validate, getGoalCalories);

module.exports = router;
