const { body } = require('express-validator');

const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const GENDERS = ['male', 'female', 'other'];
const GOALS = ['lose', 'maintain', 'gain'];
const GOAL_SPEEDS = ['mild', 'moderate', 'aggressive', 'standard'];

const baseProfileRules = [
  body('age')
    .isFloat({ min: 13, max: 100 })
    .withMessage('Age must be between 13 and 100.'),
  body('gender').isIn(GENDERS).withMessage(`Gender must be one of: ${GENDERS.join(', ')}.`),
  body('heightCm')
    .isFloat({ min: 90, max: 250 })
    .withMessage('Height must be between 90 and 250 cm.'),
  body('weightKg')
    .isFloat({ min: 25, max: 300 })
    .withMessage('Weight must be between 25 and 300 kg.'),
  body('activityLevel')
    .isIn(ACTIVITY_LEVELS)
    .withMessage(`Activity level must be one of: ${ACTIVITY_LEVELS.join(', ')}.`),
];

const maintenanceRules = [...baseProfileRules];

const goalRules = [
  ...baseProfileRules,
  body('goal').isIn(GOALS).withMessage(`Goal must be one of: ${GOALS.join(', ')}.`),
  body('goalSpeed')
    .isIn(GOAL_SPEEDS)
    .withMessage(`Goal speed must be one of: ${GOAL_SPEEDS.join(', ')}.`),
];

module.exports = {
  ACTIVITY_LEVELS,
  GENDERS,
  GOALS,
  GOAL_SPEEDS,
  maintenanceRules,
  goalRules,
};
