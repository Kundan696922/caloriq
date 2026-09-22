const express = require("express");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const { getProfile, updateProfile } = require("../controllers/user.controller");

const { updateProfileRules } = require("../utils/authValidation");

const router = express.Router();

// All user routes require authentication.
router.use(protect);

// GET /api/users/profile
router.get("/profile", getProfile);

// PATCH /api/users/profile
router.patch("/profile", updateProfileRules, validate, updateProfile);

module.exports = router;
