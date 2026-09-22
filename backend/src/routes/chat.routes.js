const express = require("express");
const rateLimit = require("express-rate-limit");

const protect = require("../middleware/authMiddleware");
const {
  sendMessage,
  listConversations,
  getConversation,
  deleteConversation,
} = require("../controllers/chat.controller");

const router = express.Router();

// Keyed by user id (protect runs first), so users behind one IP don't share a bucket.
const limitHandler = (message) => (req, res) =>
  res.status(429).json({ success: false, message });

const perMinuteLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user._id),
  handler: limitHandler(
    "You're sending messages too fast. Please wait a moment.",
  ),
});

const perDayLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user._id),
  handler: limitHandler("Daily chat limit reached. Please try again tomorrow."),
});

router.use(protect);

router.post("/messages", perMinuteLimiter, perDayLimiter, sendMessage);
router.get("/conversations", listConversations);
router.get("/conversations/:id", getConversation);
router.delete("/conversations/:id", deleteConversation);

module.exports = router;
