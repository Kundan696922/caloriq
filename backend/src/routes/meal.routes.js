const express = require("express");
const rateLimit = require("express-rate-limit");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  generate,
  save,
  list,
  getOne,
  toggleFavorite,
  remove,
  logMeal,
} = require("../controllers/meal.controller");
const {
  idRule,
  generateRules,
  saveRules,
  listRules,
  favoriteRules,
  logRules,
} = require("../utils/mealValidation");

const router = express.Router();

// All meal routes require a logged-in user.
router.use(protect);

// Every generation costs AI quota, so limit per USER (not per IP). This runs
// after validation so malformed requests don't consume the user's allowance.
const generateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user._id),
  message: {
    success: false,
    message:
      "You've generated a lot of meals recently. Please wait a few minutes and try again.",
  },
});

// POST /api/meals/generate
router.post("/generate", generateRules, validate, generateLimiter, generate);

// POST /api/meals
router.post("/", saveRules, validate, save);

// GET /api/meals?page=1&limit=12&mealType=dinner&favorite=true
router.get("/", listRules, validate, list);

// GET /api/meals/:id
router.get("/:id", idRule, validate, getOne);

// PATCH /api/meals/:id/favorite
router.patch("/:id/favorite", favoriteRules, validate, toggleFavorite);

// POST /api/meals/:id/log
router.post("/:id/log", logRules, validate, logMeal);

// DELETE /api/meals/:id
router.delete("/:id", idRule, validate, remove);

module.exports = router;
