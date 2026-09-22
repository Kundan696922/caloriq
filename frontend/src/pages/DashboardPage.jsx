import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiActivity, FiAlertCircle } from "react-icons/fi";

import Toast from "../components/common/Toast";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import CalorieSummaryCard from "../components/dashboard/CalorieSummaryCard";
import MacroProgressBar from "../components/dashboard/MacroProgressBar";
import FoodLogList from "../components/dashboard/FoodLogList";
import AddFoodPanel from "../components/dashboard/AddFoodPanel";
import useDashboard from "../hooks/useDashboard";
import CurrentWeightCard from "../components/progress/CurrentWeightCard";
import useWeight from "../hooks/useWeight";

const PROFILE_INCOMPLETE_HINT = "Complete your profile";
const WEIGHT_MISSING_HINT = "Log your weight";

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [toast, setToast] = useState("");

  const { data, loading, error, addEntry, updateEntry, removeEntry } = useDashboard();

  const { stats: weightStats } = useWeight({ withHistory: false });

  useEffect(() => {
    if (!location.state?.toast) return;

    setToast(location.state.toast);

    // Remove the toast from browser history so it
    // doesn't appear again after refreshing/navigating back.
    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }, [location, navigate]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center text-sm text-text-secondary">
        Loading your dashboard…
      </div>
    );
  }

  if (error) {
    const needsProfile = error.includes(PROFILE_INCOMPLETE_HINT);
    const needsWeight = error.includes(WEIGHT_MISSING_HINT);
    return (
      <>
        <Toast message={toast} type="success" onClose={() => setToast("")} />

        <div className="mx-auto max-w-md py-16">
          <Card className="text-center">
            <FiAlertCircle className="mx-auto mb-3 text-accent" size={28} />

            <p className="text-sm text-text-secondary">{error}</p>

            {needsProfile && (
              <Link to="/profile" className="mt-4 inline-block">
                <Button type="button" className="w-auto px-5">
                  Complete your profile
                </Button>
              </Link>
            )}

            {needsWeight && (
              <Link to="/progress" className="mt-4 inline-block">
                <Button type="button" className="w-auto px-5">
                  Log your weight
                </Button>
              </Link>
            )}
          </Card>
        </div>
      </>
    );
  }

  const { target, totals, remaining, entries } = data;
  return (
    <div className="mx-auto max-w-6xl">
      <section className="relative overflow-hidden rounded-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* BACKGROUND IMAGE */}
        <img
          src="https://images.unsplash.com/photo-1645361321497-5e44565970e2?auto=format&fit=crop&w=2000&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* CONTENT */}
        <div className="relative mx-auto w-full">
          <Toast message={toast} type="success" onClose={() => setToast("")} />

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md">
            <FiActivity size={13} className="text-accent" />
            TODAY'S DASHBOARD
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LEFT: calorie summary + weight */}
            <div className="space-y-6 lg:col-span-1">
              <Link to="/progress" className="block">
                <CurrentWeightCard stats={weightStats} />
              </Link>

              <CalorieSummaryCard
                target={target.calorieTarget}
                consumed={totals.calories}
                remaining={remaining.calories}
              />
            </div>

            {/* RIGHT: add food + macros */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="space-y-4">
                <h3 className="text-sm font-semibold text-text-primary">
                  Macros
                </h3>

                <MacroProgressBar
                  label="Protein"
                  consumed={totals.protein}
                  target={target.macros.protein.grams}
                  colorClass="bg-accent"
                />

                <MacroProgressBar
                  label="Fat"
                  consumed={totals.fat}
                  target={target.macros.fat.grams}
                  colorClass="bg-amber-500"
                />

                <MacroProgressBar
                  label="Carbs"
                  consumed={totals.carbs}
                  target={target.macros.carbs.grams}
                  colorClass="bg-sky-500"
                />
              </Card>

              <AddFoodPanel onAdd={addEntry} />

              <FoodLogList
                entries={data.entries}
                onEdit={updateEntry}
                onDelete={removeEntry}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
