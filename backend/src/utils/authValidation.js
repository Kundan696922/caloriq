const { body } = require("express-validator");

const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters."),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters."),

  body("password")
    .isString()
    .withMessage("Password must be a string.")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters."),

  body("profile.age")
    .optional()
    .isFloat({ min: 13, max: 100 })
    .withMessage("Age must be between 13 and 100."),

  body("profile.gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender."),

  body("profile.heightCm")
    .optional()
    .isFloat({ min: 90, max: 250 })
    .withMessage("Height must be between 90 and 250 cm."),

  body("profile.weightKg")
    .optional()
    .isFloat({ min: 25, max: 300 })
    .withMessage("Weight must be between 25 and 300 kg."),

  body("profile.activityLevel")
    .optional()
    .isIn(["sedentary", "light", "moderate", "active", "very_active"])
    .withMessage("Invalid activity level."),

  body("profile.goal")
    .optional()
    .isIn(["lose", "maintain", "gain"])
    .withMessage("Invalid goal."),

  body("profile.goalSpeed")
    .optional()
    .isIn(["mild", "moderate", "aggressive", "standard"])
    .withMessage("Invalid goal speed."),
];

const loginRules = [
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please provide a valid email address."),

  body("password").isString().notEmpty().withMessage("Password is required."),
];

const updateProfileRules = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters."),

  body("profile.age")
    .optional()
    .isFloat({ min: 13, max: 100 })
    .withMessage("Age must be between 13 and 100."),

  body("profile.gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender."),

  body("profile.heightCm")
    .optional()
    .isFloat({ min: 90, max: 250 })
    .withMessage("Height must be between 90 and 250 cm."),

  body("profile.weightKg")
    .optional()
    .isFloat({ min: 25, max: 300 })
    .withMessage("Weight must be between 25 and 300 kg."),

  body("profile.activityLevel")
    .optional()
    .isIn(["sedentary", "light", "moderate", "active", "very_active"])
    .withMessage("Invalid activity level."),

  body("profile.goal")
    .optional()
    .isIn(["lose", "maintain", "gain"])
    .withMessage("Invalid goal."),

  body("profile.goalSpeed")
    .optional()
    .isIn(["mild", "moderate", "aggressive", "standard"])
    .withMessage("Invalid goal speed."),
];

module.exports = {
  registerRules,
  loginRules,
  updateProfileRules,
};
