import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import MealCard from "../components/meals/MealCard";
import MealGeneratorForm from "../components/meals/MealGeneratorForm";
import MealHistory from "../components/meals/MealHistory";
import useMealGenerator from "../hooks/useMealGenerator";

const TABS = [
  { id: "generate", label: "Generate" },
  { id: "saved", label: "Saved meals" },
];

function ResultsSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <div className="h-4 w-1/3 animate-pulse rounded bg-border/60" />
          <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-border/60" />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((__, j) => (
              <div
                key={j}
                className="h-12 animate-pulse rounded-xl bg-border/60"
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function MealsPage() {
  const [tab, setTab] = useState("generate");
  const [flash, setFlash] = useState(null);
  const resultsRef = useRef(null);

  const {
    result,
    loading,
    error,
    savedIds,
    savingIndex,
    loggingIndex,
    generate,
    save,
    logToToday,
  } = useMealGenerator();

  const showFlash = useCallback((type, text, link) => {
    setFlash({ type, text, link });
  }, []);

  // Auto-dismiss messages.
  useEffect(() => {
    if (!flash) return undefined;
    const timer = setTimeout(() => setFlash(null), 5000);
    return () => clearTimeout(timer);
  }, [flash]);

  // Bring new results into view on small screens.
  useEffect(() => {
    if (result) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result]);

  async function handleSave(index) {
    try {
      await save(index);
      showFlash("success", "Meal saved to your history.");
    } catch (err) {
      showFlash("error", err.message || "Could not save that meal.");
    }
  }

  async function handleLog(index) {
    try {
      await logToToday(index);
      showFlash("success", "Added to today's log.", "/dashboard");
    } catch (err) {
      showFlash("error", err.message || "Could not log that meal.");
    }
  }

  const profileIncomplete = error.startsWith("Complete your profile");

  return (
    <div className="mx-auto max-w-6xl">
      <section className="relative overflow-hidden rounded-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* BACKGROUND IMAGE */}
        <img
          src="https://images.unsplash.com/photo-1606791422814-b32c705e3e2f?auto=format&fit=crop&w=2000&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* CONTENT */}
        <div className="relative mx-auto w-full max-w-3xl">
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AI Meals
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Meals built around your calorie and macro targets, then checked
              against USDA nutrition data.
            </p>
          </header>

          <div
            role="tablist"
            className="mb-6 inline-flex rounded-xl border border-white/20 bg-black/30 p-1 backdrop-blur-md"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {flash && (
            <div
              role="status"
              aria-live="polite"
              className={`mb-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm backdrop-blur-md ${
                flash.type === "success"
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-red-400/40 bg-red-400/10 text-red-400"
              }`}
            >
              <span>{flash.text}</span>

              {flash.link && (
                <Link
                  to={flash.link}
                  className="shrink-0 font-medium underline"
                >
                  View dashboard
                </Link>
              )}
            </div>
          )}

          {tab === "generate" && (
            <div className="space-y-6">
              <MealGeneratorForm onGenerate={generate} loading={loading} />

              {error && (
                <Card>
                  <p className="text-sm text-red-400">{error}</p>

                  {profileIncomplete && (
                    <Link
                      to="/profile"
                      className="mt-3 inline-block text-sm font-medium text-accent underline"
                    >
                      Go to your profile
                    </Link>
                  )}
                </Card>
              )}

              {loading && <ResultsSkeleton />}

              {result && !loading && (
                <section ref={resultsRef} className="scroll-mt-24 space-y-4">
                  <p className="text-xs text-white/60">
                    Target per serving: {result.targets.calories} kcal · Protein{" "}
                    {result.targets.protein}g · Carbs {result.targets.carbs}g ·
                    Fat {result.targets.fat}g
                  </p>

                  {result.meals.map((meal, index) => {
                    const saved = Boolean(savedIds[index]);

                    return (
                      <MealCard
                        key={`${meal.title}-${index}`}
                        meal={meal}
                        defaultOpen={result.meals.length === 1}
                        footer={
                          saved ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                                <FiCheck size={14} />
                                Saved
                              </span>

                              <Button
                                variant="secondary"
                                loading={loggingIndex === index}
                                onClick={() => handleLog(index)}
                                className="px-3 py-2"
                              >
                                Log to today
                              </Button>
                            </>
                          ) : (
                            <Button
                              loading={savingIndex === index}
                              disabled={savingIndex !== null}
                              onClick={() => handleSave(index)}
                              className="px-4 py-2"
                            >
                              Save meal
                            </Button>
                          )
                        }
                      />
                    );
                  })}
                </section>
              )}
            </div>
          )}

          {tab === "saved" && <MealHistory onFlash={showFlash} />}
        </div>
      </section>
    </div>
  );
}
