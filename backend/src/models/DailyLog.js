const mongoose = require("mongoose");

/**
 * A single logged food entry. Nutrients are stored as a SNAPSHOT (already
 * scaled by quantity) at log time, so a food's nutrition changing upstream
 * in USDA data never rewrites history.
 */
const logEntrySchema = new mongoose.Schema(
  {
    fdcId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    servingSize: {
      type: Number,
      required: true,
    },
    servingSizeUnit: {
      type: String,
      required: true,
    },
    // Multiplier applied on top of the base servingSize (e.g. 1.5 servings).
    quantity: {
      type: Number,
      required: true,
      min: 0.1,
      default: 1,
    },
    // Already scaled by `quantity` — this is what actually counts toward totals.
    nutrients: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sugars: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const dailyLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Stored as 'YYYY-MM-DD' (user-local calendar day) rather than a Date,
    // so "today" is unambiguous and querying/upserting by day is a simple
    // string match instead of a UTC range query.
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    entries: [logEntrySchema],
  },
  { timestamps: true },
);

// One log document per user per calendar day.
dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyLog", dailyLogSchema);
