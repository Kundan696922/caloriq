import { useState } from "react";
import { FiX } from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";

import Card from "../common/Card";
import Button from "../common/Button";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

const FIT_OPTIONS = [
  { value: "meal_share", label: "Share of daily target" },
  { value: "remaining_today", label: "Fit what's left today" },
];

const DIET_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "gluten_free", label: "Gluten-free" },
  { value: "dairy_free", label: "Dairy-free" },
  { value: "halal", label: "Halal" },
  { value: "keto", label: "Keto" },
  { value: "low_carb", label: "Low carb" },
  { value: "high_protein", label: "High protein" },
];

const PREP_OPTIONS = [
  { value: "", label: "Any" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
];

const PREFS_KEY = "caloriq_meal_prefs";
const TERM_PATTERN = /^[\p{L}\s'’-]+$/u; // mirrors the backend rule
const MAX_TAGS = 10;

// Allergies / diet are remembered between visits so they're never forgotten.
function loadPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
    const strings = (v) =>
      Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
    return {
      dietaryPreferences: strings(raw.dietaryPreferences).filter((p) =>
        DIET_OPTIONS.some((o) => o.value === p),
      ),
      allergies: strings(raw.allergies).slice(0, MAX_TAGS),
      excludedFoods: strings(raw.excludedFoods).slice(0, MAX_TAGS),
    };
  } catch {
    return { dietaryPreferences: [], allergies: [], excludedFoods: [] };
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable (private mode, quota): remembering is optional.
  }
}

function defaultMealType() {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border text-text-secondary hover:border-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-text-primary">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-text-secondary">{hint}</p>}
    </div>
  );
}

function TagInput({ values, onChange, placeholder }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function commit() {
    const tag = draft.trim().toLowerCase();
    if (!tag) return;

    if (tag.length < 2 || tag.length > 40 || !TERM_PATTERN.test(tag)) {
      setError("Use 2-40 letters only (spaces and hyphens allowed).");
      return;
    }
    if (values.length >= MAX_TAGS) {
      setError(`You can add up to ${MAX_TAGS}.`);
      return;
    }
    if (!values.includes(tag)) onChange([...values, tag]);
    setDraft("");
    setError("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-bg px-2 py-1.5 focus-within:border-accent">
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-white/5 py-1 pl-2.5 pr-1.5 text-xs text-text-primary"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(values.filter((v) => v !== tag))}
              className="rounded-full p-0.5 text-text-secondary hover:text-text-primary"
            >
              <FiX size={12} />
            </button>
          </span>
        ))}

        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={values.length === 0 ? placeholder : ""}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function MealGeneratorForm({ onGenerate, loading }) {
  const initial = loadPrefs();

  const [mealType, setMealType] = useState(defaultMealType);
  const [count, setCount] = useState(2);
  const [fitTo, setFitTo] = useState("meal_share");
  const [dietaryPreferences, setDietaryPreferences] = useState(
    initial.dietaryPreferences,
  );
  const [allergies, setAllergies] = useState(initial.allergies);
  const [excludedFoods, setExcludedFoods] = useState(initial.excludedFoods);
  const [cuisine, setCuisine] = useState("");
  const [maxPrepMinutes, setMaxPrepMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  function toggleDiet(value) {
    setDietaryPreferences((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    const cleanCuisine = cuisine.trim();
    if (cleanCuisine && !TERM_PATTERN.test(cleanCuisine)) {
      setFormError("Cuisine may only contain letters, spaces and hyphens.");
      return;
    }
    setFormError("");

    savePrefs({ dietaryPreferences, allergies, excludedFoods });

    onGenerate({
      mealType,
      count,
      fitTo,
      dietaryPreferences,
      allergies,
      excludedFoods,
      ...(cleanCuisine ? { cuisine: cleanCuisine } : {}),
      ...(maxPrepMinutes ? { maxPrepMinutes: Number(maxPrepMinutes) } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Meal">
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((t) => (
              <Chip
                key={t.value}
                active={mealType === t.value}
                onClick={() => setMealType(t.value)}
              >
                {t.label}
              </Chip>
            ))}
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Size it as">
            <div className="flex flex-wrap gap-2">
              {FIT_OPTIONS.map((o) => (
                <Chip
                  key={o.value}
                  active={fitTo === o.value}
                  onClick={() => setFitTo(o.value)}
                >
                  {o.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="How many options">
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                  {n}
                </Chip>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Dietary preferences">
          <div className="flex flex-wrap gap-2">
            {DIET_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                active={dietaryPreferences.includes(o.value)}
                onClick={() => toggleDiet(o.value)}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field
          label="Allergies"
          hint="Type one and press Enter. We check every meal against these, but always read the ingredient list yourself."
        >
          <TagInput
            values={allergies}
            onChange={setAllergies}
            placeholder="e.g. peanuts, shellfish, dairy"
          />
        </Field>

        <Field label="Foods to avoid">
          <TagInput
            values={excludedFoods}
            onChange={setExcludedFoods}
            placeholder="e.g. mushrooms, olives"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Cuisine (optional)">
            <input
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              maxLength={50}
              placeholder="e.g. Indian, Mediterranean"
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
            />
          </Field>

          <Field label="Max total time">
            <div className="flex flex-wrap gap-2">
              {PREP_OPTIONS.map((o) => (
                <Chip
                  key={o.label}
                  active={maxPrepMinutes === o.value}
                  onClick={() => setMaxPrepMinutes(o.value)}
                >
                  {o.label}
                </Chip>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Anything else? (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={300}
            rows={2}
            placeholder="e.g. I only have a microwave, or I train in the evening"
            className="w-full resize-none rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
          />
          <p className="mt-1 text-right text-[11px] text-text-secondary">
            {notes.length}/300
          </p>
        </Field>

        {formError && <p className="text-xs text-red-400">{formError}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            {!loading && <LuSparkles size={15} />}
            {loading ? "Generating…" : "Generate meals"}
          </Button>
          {loading && (
            <p className="text-xs text-text-secondary">
              Building and verifying your meals. This can take up to a minute.
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
