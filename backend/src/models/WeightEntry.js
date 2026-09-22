const mongoose = require("mongoose");

/**
 * A single weight check-in. One entry per user per calendar day — logging
 * again on the same date updates that day's entry rather than creating a
 * duplicate (see the upsert in weight.controller.js addWeightEntry).
 */
const weightEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Stored as 'YYYY-MM-DD' (user-local calendar day), same convention as
    // DailyLog.date — keeps "today" unambiguous and upserts a simple match.
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 25,
      max: 300,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 280,
      default: "",
    },
  },
  { timestamps: true },
);

// One weight entry per user per calendar day.
weightEntrySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WeightEntry", weightEntrySchema);
