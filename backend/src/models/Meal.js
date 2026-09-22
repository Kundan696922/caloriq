const mongoose = require("mongoose");
const {
  MEAL_TYPES,
  INGREDIENT_SOURCES,
  DIETARY_PREFERENCES,
  FIT_TO_OPTIONS,
} = require("../utils/mealConstants");

const nutrientField = () => ({ type: Number, default: 0, min: 0 });

// Same seven keys as DailyLog entries, so a saved meal can be logged 1:1.
const nutrientsSchema = new mongoose.Schema(
  {
    calories: nutrientField(),
    protein: nutrientField(),
    fat: nutrientField(),
    carbs: nutrientField(),
    fiber: nutrientField(),
    sugars: nutrientField(),
    sodium: nutrientField(),
  },
  { _id: false },
);

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    searchTerm: { type: String, trim: true, maxlength: 100 },
    grams: { type: Number, required: true, min: 0.1 },
    displayQuantity: { type: Number, min: 0 },
    displayUnit: { type: String, trim: true, maxlength: 30 },
    // Already scaled to `grams` (NOT per 100 g).
    nutrients: { type: nutrientsSchema, default: () => ({}) },
    source: { type: String, enum: INGREDIENT_SOURCES, default: "ai_estimate" },
    fdcId: { type: String },
    usdaDescription: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false },
);

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 300, default: "" },
    mealType: { type: String, enum: MEAL_TYPES, required: true },
    servings: { type: Number, default: 1, min: 1 },
    prepTimeMinutes: { type: Number, default: 0, min: 0 },
    cookTimeMinutes: { type: Number, default: 0, min: 0 },
    ingredients: { type: [ingredientSchema], default: [] },
    instructions: { type: [String], default: [] },

    // Per serving. Always RECOMPUTED by the server from `ingredients`.
    nutrients: { type: nutrientsSchema, default: () => ({}) },

    validation: {
      // verified: >=80% of calories USDA-backed, partial: >=40%, else estimated
      status: {
        type: String,
        enum: ["verified", "partial", "estimated"],
        default: "estimated",
      },
      warnings: { type: [String], default: [] },
      verifiedCalorieShare: { type: Number, min: 0, max: 100, default: 0 },
    },

    // Snapshot of what the user asked for when this meal was generated.
    generationParams: {
      fitTo: { type: String, enum: FIT_TO_OPTIONS },
      cuisine: { type: String, trim: true, maxlength: 50 },
      maxPrepMinutes: { type: Number, min: 0 },
      dietaryPreferences: [{ type: String, enum: DIETARY_PREFERENCES }],
      allergies: [{ type: String, trim: true, maxlength: 40 }],
      targetCalories: { type: Number, min: 0 },
      targetProtein: { type: Number, min: 0 },
      targetFat: { type: Number, min: 0 },
      targetCarbs: { type: Number, min: 0 },
    },

    aiModel: { type: String, trim: true, maxlength: 60, default: "unknown" },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// History listing + filters
mealSchema.index({ user: 1, createdAt: -1 });
mealSchema.index({ user: 1, isFavorite: 1, createdAt: -1 });
mealSchema.index({ user: 1, mealType: 1, createdAt: -1 });

module.exports = mongoose.model("Meal", mealSchema);
