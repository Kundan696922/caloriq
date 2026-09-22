const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  logout,
  getCurrentUser,
} = require("../controllers/auth.controller");

const  protect  = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const { registerRules, loginRules } = require("../utils/authValidation");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

// POST /api/auth/register
router.post("/register", authLimiter, registerRules, validate, register);

// POST /api/auth/login
router.post("/login", authLimiter, loginRules, validate, login);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/me
router.get("/me", protect, getCurrentUser);

module.exports = router;
