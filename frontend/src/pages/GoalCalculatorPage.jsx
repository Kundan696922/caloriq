import { useEffect, useRef, useState } from "react";
import { FiTarget, FiInfo, FiActivity, FiTrendingUp } from "react-icons/fi";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import SegmentedControl from "../components/common/SegmentedControl";
import ProfileFields from "../components/calculator/ProfileFields";
import MacroBreakdown from "../components/calculator/MacroBreakdown";
import { fetchGoalCalories } from "../services/calculatorService";
import { validateProfileFields, hasErrors } from "../utils/validation";

const DEFAULTS = {
  age: 28,
  gender: "male",
  heightCm: 175,
  weightKg: 70,
  activityLevel: "moderate",
  goal: "lose",
  goalSpeed: "moderate",
};

const GOAL_OPTIONS = [
  { value: "lose", label: "Lose weight" },
  { value: "maintain", label: "Maintain weight" },
  { value: "gain", label: "Gain weight" },
];

const SPEED_OPTIONS = {
  lose: [
    { value: "mild", label: "Mild (~0.25 kg/wk)" },
    { value: "moderate", label: "Moderate (~0.5 kg/wk)" },
    { value: "aggressive", label: "Aggressive (~0.75 kg/wk)" },
  ],
  gain: [
    { value: "mild", label: "Mild (~0.25 kg/wk)" },
    { value: "moderate", label: "Moderate (~0.5 kg/wk)" },
    { value: "aggressive", label: "Aggressive (~0.75 kg/wk)" },
  ],
  maintain: [{ value: "standard", label: "Standard" }],
};

const QUICK_FEATURES = [
  {
    title: "Set your calorie target",
    desc: "Get a daily calorie target based on your body, activity, and goal.",
    icon: FiTarget,
  },
  {
    title: "Understand your macros",
    desc: "See estimated protein, carbs, and fat targets to support your goal.",
    icon: FiActivity,
  },
  {
    title: "Track your progress",
    desc: "Use your target as a practical starting point for consistent progress.",
    icon: FiTrendingUp,
  },
];

export default function GoalCalculatorPage() {
  const [values, setValues] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const calculatorRef = useRef(null);

  function handleGoalChange(goal) {
    const speeds = SPEED_OPTIONS[goal];

    setValues((v) => ({
      ...v,
      goal,
      goalSpeed: speeds[Math.min(1, speeds.length - 1)].value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setApiError("");

    const fieldErrors = validateProfileFields(values);
    setErrors(fieldErrors);

    if (hasErrors(fieldErrors)) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await fetchGoalCalories({
        age: Number(values.age),
        gender: values.gender,
        heightCm: Number(values.heightCm),
        weightKg: Number(values.weightKg),
        activityLevel: values.activityLevel,
        goal: values.goal,
        goalSpeed: values.goalSpeed,
      });

      setResult(data);
    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Mobile: scroll down to result
  // PC: scroll up to calculator
  useEffect(() => {
    if (!result) return;

    setTimeout(() => {
      const isMobile = window.innerWidth < 1024;

      if (isMobile) {
        const resultElement = document.getElementById("calculator-result");

        if (resultElement) {
          resultElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } else {
        if (calculatorRef.current) {
          calculatorRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    }, 100);
  }, [result]);

  return (
    <div className="mx-auto max-w-6xl">
      <section
        ref={calculatorRef}
        className="relative overflow-hidden rounded-3xl px-4 py-6 sm:px-6 sm:py-8"
      >
        {/* BACKGROUND IMAGE */}
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
        <div className="absolute inset-0 bg-black/10" />

        {/* CONTENT */}
        <div className="relative mx-auto w-full">
          {/* HEADER */}
          <div className="mb-6 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md">
              <FiTarget size={13} className="text-accent" />
              GOAL CALCULATOR
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Goal Calorie & Macro Calculator
            </h1>
          </div>

          {/* FORM + RESULT */}
          <div
            className={
              result
                ? "mx-auto grid w-full max-w-5xl grid-cols-1 items-start gap-6 lg:grid-cols-2"
                : "mx-auto flex w-full max-w-sm justify-center"
            }
          >
            {/* FORM */}
            <Card className="w-full border-white/10 bg-black/65 px-4 py-4 shadow-2xl backdrop-blur-xl sm:px-5 sm:py-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* FORM TITLE */}
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Your details
                  </h2>

                  <p className="mt-0.5 text-xs text-white/45">
                    Enter your information and choose your goal.
                  </p>
                </div>

                {/* PROFILE */}
                <ProfileFields
                  values={values}
                  onChange={setValues}
                  errors={errors}
                />

                {/* GOAL */}
                <SegmentedControl
                  label="Goal"
                  value={values.goal}
                  onChange={handleGoalChange}
                  options={GOAL_OPTIONS}
                />

                {/* PACE */}
                <SegmentedControl
                  label="Pace"
                  value={values.goalSpeed}
                  onChange={(goalSpeed) =>
                    setValues((v) => ({
                      ...v,
                      goalSpeed,
                    }))
                  }
                  options={SPEED_OPTIONS[values.goal]}
                />

                {/* API ERROR */}
                {apiError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                    <FiInfo className="mt-0.5 shrink-0" size={15} />

                    <span>{apiError}</span>
                  </div>
                )}

                {/* BUTTON */}
                <Button type="submit" loading={loading} className="w-full">
                  Calculate
                </Button>
              </form>
            </Card>

            {/* RESULT */}
            {result && (
              <div id="calculator-result">
                <Card className="w-full border-white/10 bg-black/65 px-4 py-4 shadow-2xl backdrop-blur-xl sm:px-5 sm:py-5">
                  {/* RESULT HEADER */}
                  <div>
                    <p className="text-sm text-white/55">Your daily target</p>

                    <p className="mt-1 text-4xl font-bold text-accent">
                      {result.calorieTarget.toLocaleString()}
                    </p>

                    <p className="text-xs text-white/45">kcal / day</p>
                  </div>

                  {/* BMR + MAINTENANCE */}
                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-white/55">
                    <p>
                      BMR:{" "}
                      <span className="text-white">
                        {result.bmr.toLocaleString()}
                      </span>{" "}
                      kcal
                    </p>

                    <p>
                      Maintenance:{" "}
                      <span className="text-white">
                        {result.tdee.toLocaleString()}
                      </span>{" "}
                      kcal
                    </p>
                  </div>

                  {/* MACROS */}
                  <div className="mt-6">
                    <p className="mb-3 text-sm text-white/55">
                      Estimated macro targets
                    </p>

                    <MacroBreakdown
                      macros={result.macros}
                      calorieTarget={result.calorieTarget}
                    />
                  </div>

                  {/* DISCLAIMER */}
                  <p className="mt-5 text-xs leading-relaxed text-white/45">
                    These figures are estimates based on standard formulas — not
                    medical advice. Consult a qualified professional (e.g. a
                    registered dietitian or doctor) before making significant
                    changes to your diet.
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUICK FEATURES */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {QUICK_FEATURES.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-accent">
                <Icon size={21} />
              </div>

              <h3 className="font-semibold text-text-primary">
                {feature.title}
              </h3>

              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {feature.desc}
              </p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
