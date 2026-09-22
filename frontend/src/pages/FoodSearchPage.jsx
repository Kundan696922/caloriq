import { useEffect, useState } from "react";
import {
  FiSearch,
  FiChevronRight,
  FiActivity,
  FiBookOpen,
} from "react-icons/fi";

import { LuUtensils } from "react-icons/lu";

import FoodSearchBar from "../components/food/FoodSearchBar";
import FoodResultsList from "../components/food/FoodResultsList";
import Pagination from "../components/food/Pagination";
import FoodDetailPanel from "../components/food/FoodDetailPanel";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { searchFoods } from "../services/foodService";

const MIN_QUERY_LENGTH = 2;
const PAGE_SIZE = 25;

const QUICK_FOODS = ["Eggs", "Chicken", "Rice", "Apple", "Banana", "Oats"];

export default function FoodSearchPage() {
  const [query, setQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFdcId, setSelectedFdcId] = useState(null);

  const debouncedQuery = useDebouncedValue(query, 400);

  const QUICK_FEATURES = [
    {
      title: "Explore nutrition",
      desc: "Find calories, protein, carbs, fat, and other nutrition information for foods.",
      icon: FiActivity,
    },
    {
      title: "Search thousands of foods",
      desc: "Quickly search for common foods and discover their nutritional details.",
      icon: FiSearch,
    },
    {
      title: "Make informed choices",
      desc: "Compare nutrition information to better understand what you're eating.",
      icon: FiBookOpen,
    },
  ];

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedQuery]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResult(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    setIsLoading(true);
    setError(null);

    searchFoods({
      q: trimmed,
      pageSize: PAGE_SIZE,
      pageNumber,
    })
      .then((data) => {
        if (!isCancelled) {
          setResult(data);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, pageNumber]);

  const hasSearched = debouncedQuery.trim().length >= MIN_QUERY_LENGTH;

  const foods = result?.foods ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="relative overflow-hidden rounded-3xl px-4 py-8 sm:px-8 sm:py-10">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=2000&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative mx-auto w-full max-w-4xl">
          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md">
              <FiSearch size={13} className="text-accent" />
              FOOD EXPLORER
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Find Your Food
            </h1>
          </div>

          {/* Search */}
          <div className="mx-auto w-full max-w-2xl">
            <FoodSearchBar value={query} onChange={setQuery} />
          </div>

          {/* Quick foods */}
          {!hasSearched && (
            <div className="mx-auto mt-5 w-full max-w-2xl">
              <div className="rounded-2xl border border-white/10 bg-black/55 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <LuUtensils size={17} className="text-accent" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Explore foods
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-white/50">
                      Try a popular food to quickly see its nutrition
                      information.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK_FOODS.map((food) => (
                    <button
                      key={food}
                      type="button"
                      onClick={() => setQuery(food)}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
                    >
                      {food}
                      <FiChevronRight
                        size={12}
                        className="opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="mt-6">
            <FoodResultsList
              foods={foods}
              isLoading={isLoading}
              error={error}
              hasSearched={hasSearched}
              onSelect={(food) => setSelectedFdcId(food.fdcId)}
            />
          </div>

          {/* Pagination */}
          {result && !isLoading && (
            <div className="mt-6">
              <Pagination
                pageNumber={result.pageNumber}
                totalPages={result.totalPages}
                onPageChange={setPageNumber}
              />
            </div>
          )}

          {/* Detail panel */}
          <FoodDetailPanel
            fdcId={selectedFdcId}
            onClose={() => setSelectedFdcId(null)}
          />
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
