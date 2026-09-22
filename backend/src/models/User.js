const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters."],
      maxlength: [50, "Name must not exceed 50 characters."],
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, "Email must not exceed 100 characters."],
    },

    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: 8,
      select: false,
    },

    profile: {
      age: {
        type: Number,
        min: 13,
        max: 100,
      },

      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },

      heightCm: {
        type: Number,
        min: 90,
        max: 250,
      },

      weightKg: {
        type: Number,
        min: 25,
        max: 300,
      },

      activityLevel: {
        type: String,
        enum: ["sedentary", "light", "moderate", "active", "very_active"],
      },

      goal: {
        type: String,
        enum: ["lose", "maintain", "gain"],
      },

      goalSpeed: {
        type: String,
        enum: ["mild", "moderate", "aggressive", "standard"],
      },

      // --- Phase 6: Weight & Progress ---
      // Optional and NOT in REQUIRED_PROFILE_FIELDS (dashboard.controller.js),
      // so existing users without these set still pass the calorie-target
      // check. goalWeightProgress simply degrades to "not set" until filled in.
      startWeightKg: {
        type: Number,
        min: 25,
        max: 300,
      },

      goalWeightKg: {
        type: Number,
        min: 25,
        max: 300,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
