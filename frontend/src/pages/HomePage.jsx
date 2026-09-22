import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiArrowRight,
  FiTarget,
  FiActivity,
  FiBookOpen,
  FiBarChart2,
} from "react-icons/fi";

import Button from "../components/common/Button";
import Toast from "../components/common/Toast";
import useAuth  from "../hooks/useAuth";

const GUEST_FEATURES = [
  {
    title: "Maintenance Calculator",
    desc: "Find out how many calories you need each day to maintain your current weight.",
    to: "/calculators/maintenance",
    cta: "Calculate",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Goal Calculator",
    desc: "Set a calorie target based on whether you want to lose, maintain, or gain weight.",
    to: "/calculators/goal",
    cta: "Set your goal",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Food Explorer",
    desc: "Explore calories, protein, carbs, fat, and other nutrition information for thousands of foods.",
    to: "/foods",
    cta: "Explore foods",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85",
  },
];

const LOGGED_IN_FEATURES = [
  {
    title: "Your Dashboard",
    desc: "See your daily calories, macros, food log, and nutrition progress in one place.",
    to: "/dashboard",
    cta: "Open dashboard",
    image:
      "https://images.unsplash.com/photo-1704223523571-2b3778308425?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Weight Progress",
    desc: "Track your weight over time and see how your progress is moving toward your goal.",
    to: "/progress",
    cta: "Track progress",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "AI Meal Ideas",
    desc: "Get personalized meal ideas based on your calorie and nutrition goals.",
    to: "/meals",
    cta: "Explore meals",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85",
  },
];

const GUEST_QUICK_FEATURES = [
  {
    title: "Know your calories",
    desc: "Get a simple estimate based on your body and activity.",
    icon: FiActivity,
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Understand your food",
    desc: "Explore nutrition information before you eat.",
    icon: FiBookOpen,
    image:
      "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Work toward a goal",
    desc: "Turn your calorie needs into a practical target.",
    icon: FiTarget,
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=85",
  },
];

const LOGGED_IN_QUICK_FEATURES = [
  {
    title: "Track your calories",
    desc: "Keep your daily food intake organized and see how much you have left.",
    icon: FiActivity,
  },
  {
    title: "Get meal ideas",
    desc: "Discover meal suggestions that fit your calorie and nutrition goals.",
    icon: FiBookOpen,
  },
  {
    title: "Monitor your progress",
    desc: "Record your weight and follow your progress over time.",
    icon: FiBarChart2,
  },
];

export default function HomePage() {
  const location = useLocation();
  const { user, loading } = useAuth();

  const [toast, setToast] = useState("");

  const isLoggedIn = !!user;

  const features = isLoggedIn ? LOGGED_IN_FEATURES : GUEST_FEATURES;

  const quickFeatures = isLoggedIn
    ? LOGGED_IN_QUICK_FEATURES
    : GUEST_QUICK_FEATURES;

  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // Prevent the guest version briefly appearing while auth is being checked.
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Toast */}
      <Toast message={toast} type="success" onClose={() => setToast("")} />

      {/* HERO */}
      <section className="relative min-h-[560px] overflow-hidden rounded-3xl">
        <img
          src={
            isLoggedIn
              ? "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=2000&q=85"
              : "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=2000&q=85"
          }
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative flex min-h-[560px] items-end p-6 sm:p-10 lg:p-14">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-md">
              {isLoggedIn
                ? "WELCOME BACK. KEEP MAKING PROGRESS."
                : "SIMPLE NUTRITION. SMARTER PROGRESS."}
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {isLoggedIn ? (
                <>
                  Keep going.
                  <br />
                  <span className="text-accent">Reach your goal.</span>
                </>
              ) : (
                <>
                  Know what to eat.
                  <br />
                  <span className="text-accent">Reach your goal.</span>
                </>
              )}
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
              {isLoggedIn
                ? "Track your food, monitor your weight, and stay focused on your nutrition goals."
                : "Calculate your calories, understand your food, and make smarter nutrition decisions — all in one place."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="primary">Open Dashboard</Button>
                  </Link>

                  <Link to="/progress">
                    <Button
                      variant="secondary"
                      className="border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                    >
                      Track Progress
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button variant="primary">Get Started</Button>
                  </Link>

                  <Link to="/foods">
                    <Button
                      variant="secondary"
                      className="border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                    >
                      Explore Foods
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TOOLS / PERSONAL FEATURES */}
      <section>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {isLoggedIn ? "Your Caloriq" : "Explore Caloriq"}
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            {isLoggedIn
              ? "Keep your progress moving"
              : "Start with what you need"}
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            {isLoggedIn
              ? "Everything you need to track your nutrition and stay consistent with your goal."
              : "Simple tools to help you understand your calories and nutrition."}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.to}
              className="group block overflow-hidden rounded-3xl"
            >
              <div className="relative h-[330px] overflow-hidden rounded-3xl">
                <img
                  src={feature.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {feature.desc}
                  </p>

                  <div className="mt-5">
                    <span className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition group-hover:bg-accent">
                      {feature.cta}

                      <FiArrowRight
                        className="ml-2 transition-transform group-hover:translate-x-1"
                        size={16}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ACCOUNT / PROGRESS SECTION */}
      <section className="relative overflow-hidden rounded-3xl">
        <img
          src={
            isLoggedIn
              ? "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=85"
              : "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1800&q=85"
          }
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/75" />

        <div className="relative px-6 py-14 text-center sm:px-10 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {isLoggedIn ? "Stay consistent" : "Your nutrition journey"}
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {isLoggedIn ? "Small steps add up." : "Make every meal count."}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
            {isLoggedIn
              ? "Keep logging your meals and weight to build a clearer picture of your progress."
              : "Create a free Caloriq account and unlock a more personalized nutrition experience."}
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard">
                  <Button variant="primary">Go to Dashboard</Button>
                </Link>

                <Link to="/progress">
                  <Button
                    variant="secondary"
                    className="border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  >
                    View Progress
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary">Create Free Account</Button>
                </Link>

                <Link to="/login">
                  <Button
                    variant="secondary"
                    className="border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  >
                    Log In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* QUICK FEATURES */}
      <section className="grid gap-4 sm:grid-cols-3">
        {quickFeatures.map((feature) => {
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
