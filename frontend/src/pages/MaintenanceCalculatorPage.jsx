import { useEffect, useRef, useState } from "react";
import { FiActivity, FiInfo, FiTarget, FiTrendingUp } from "react-icons/fi";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import ProfileFields from "../components/calculator/ProfileFields";
import MaintenanceResult from "../components/calculator/MaintenanceResult";
import { fetchMaintenanceCalories } from "../services/calculatorService";
import { validateProfileFields, hasErrors } from "../utils/validation";

const DEFAULTS = {
  age: 28,
  gender: "male",
  heightCm: 175,
  weightKg: 70,
  activityLevel: "moderate",
};

const QUICK_FEATURES = [
  {
    title: "Daily calorie needs",
    desc: "Understand how many calories your body needs to maintain your current weight.",
    icon: FiActivity,
  },
  {
    title: "Track your progress",
    desc: "Use your calorie target as a starting point for making smarter nutrition decisions.",
    icon: FiTrendingUp,
  },
  {
    title: "Set better goals",
    desc: "Use your maintenance calories to create a practical weight loss or gain target.",
    icon: FiTarget,
  },
];

export default function MaintenanceCalculatorPage() {
  const [values, setValues] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const calculatorRef = useRef(null);
  const resultRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();

    setApiError("");

    const fieldErrors = validateProfileFields(values);
    setErrors(fieldErrors);

    if (hasErrors(fieldErrors)) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await fetchMaintenanceCalories({
        age: Number(values.age),
        gender: values.gender,
        heightCm: Number(values.heightCm),
        weightKg: Number(values.weightKg),
        activityLevel: values.activityLevel,
      });

      setResult(data);
    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // PC: scroll up to calculator
  // Mobile: scroll down to result
  useEffect(() => {
    if (!result) return;

    setTimeout(() => {
      const isMobile = window.innerWidth < 1024;

      if (isMobile) {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({
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
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=85"
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
              <FiActivity size={13} className="text-accent" />
              CALORIE CALCULATOR
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Maintenance Calories
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
                    Enter your information to calculate your calorie needs.
                  </p>
                </div>

                {/* PROFILE FIELDS */}
                <ProfileFields
                  values={values}
                  onChange={setValues}
                  errors={errors}
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
                  Calculate Calories
                </Button>
              </form>
            </Card>

            {/* RESULT */}
            {result && (
              <div ref={resultRef} className="scroll-mt-6">
                <MaintenanceResult result={result} />
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
