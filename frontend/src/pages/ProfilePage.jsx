import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import ProfileFields from "../components/calculator/ProfileFields";
import useAuth from "../hooks/useAuth";
import useWeight from "../hooks/useWeight";
import { updateUserProfile } from "../services/authService";

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

// Fields required by the backend's dashboard calorie/macro target
// calculation (see REQUIRED_PROFILE_FIELDS in dashboard.controller.js,
// minus weightKg which now comes from WeightEntry instead of profile).
const REQUIRED_FIELDS = [
  "age",
  "gender",
  "heightCm",
  "activityLevel",
  "goal",
  "goalSpeed",
];

const FIELD_LABELS = {
  age: "Age",
  gender: "Gender",
  heightCm: "Height",
  activityLevel: "Activity level",
  goal: "Goal",
  goalSpeed: "Pace",
};

function getInitialProfile(profile) {
  return {
    age: profile?.age ?? "",
    gender: profile?.gender ?? "",
    heightCm: profile?.heightCm ?? "",
    activityLevel: profile?.activityLevel ?? "",
    goal: profile?.goal ?? "",
    goalSpeed: profile?.goalSpeed ?? "",
  };
}

function getInitials(name) {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

// Returns a { fieldName: "Required" } map for any required field that's
// empty/undefined/null. Used both to disable Save and to show inline errors.
function getProfileErrors(profile) {
  const errors = {};

  REQUIRED_FIELDS.forEach((field) => {
    const value = profile[field];
    if (value === "" || value === undefined || value === null) {
      errors[field] = "Required";
    }
  });

  return errors;
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>

      <p className="mt-1 text-sm leading-5 text-text-secondary">
        {description}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");

  const [profile, setProfile] = useState(getInitialProfile(user?.profile));

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { stats: weightStats } = useWeight({
    withHistory: false,
  });

  const profileErrors = getProfileErrors(profile);
  const hasErrors = Object.keys(profileErrors).length > 0;
  const missingLabels = Object.keys(profileErrors).map(
    (field) => FIELD_LABELS[field] || field,
  );

  function handleGoalChange(goal) {
    const speeds = SPEED_OPTIONS[goal];

    setProfile((previous) => ({
      ...previous,
      goal,
      goalSpeed:
        goal === "maintain"
          ? "standard"
          : speeds?.some((speed) => speed.value === previous.goalSpeed)
            ? previous.goalSpeed
            : speeds?.[1]?.value || speeds?.[0]?.value || "",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Guard against submitting with required fields empty. The button is
    // also disabled in this case, but this protects against edge cases
    // (e.g. pressing Enter in a field) bypassing the disabled state.
    if (hasErrors) {
      setError(
        `Please fill in all required fields before saving: ${missingLabels.join(", ")}.`,
      );
      return;
    }

    setError("");
    setSaving(true);

    const normalizedProfile = {
      ...profile,

      age: profile.age === "" ? undefined : Number(profile.age),

      heightCm: profile.heightCm === "" ? undefined : Number(profile.heightCm),
    };

    try {
      const response = await updateUserProfile({
        name,
        profile: normalizedProfile,
      });

      if (response.success) {
        updateUser({
          name,
          profile: normalizedProfile,
        });

        navigate("/dashboard", {
          replace: true,
          state: {
            toast: "Profile updated successfully!",
          },
        });
      }
    } catch (err) {
      setError(err.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-background">
            {getInitials(user?.name)}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              Your Profile
            </h1>

            <p className="mt-1 text-sm text-text-secondary">{user?.email}</p>
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-6 text-text-secondary">
          Keep your information up to date so Calor
          <span className="text-accent">iq</span> can personalize your calorie
          and macro targets.
        </p>
      </div>

      <Card>
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* ACCOUNT */}
          <section>
            <SectionHeader
              title="Account"
              description="Basic information associated with your Caloriq account."
            />

            <div className="space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-text-primary">
                  Name
                </span>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  maxLength={50}
                  required
                  placeholder="Your name"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </label>

              <div>
                <span className="text-sm font-medium text-text-primary">
                  Email
                </span>

                <div className="mt-2 rounded-xl border border-border bg-background px-4 py-3">
                  <p className="text-sm text-text-primary">{user?.email}</p>
                </div>

                <p className="mt-2 text-xs text-text-secondary">
                  Email cannot currently be changed.
                </p>
              </div>
            </div>
          </section>

          {/* BODY + ACTIVITY */}
          <section className="border-t border-border pt-8">
            <SectionHeader
              title="Body & Activity"
              description="These details are used to calculate your personalized calorie and macro targets."
            />

            <ProfileFields
              values={profile}
              onChange={setProfile}
              errors={profileErrors}
              showWeight={false}
            />
          </section>

          {/* CURRENT WEIGHT */}
          <section className="border-t border-border pt-8">
            <SectionHeader
              title="Current Weight"
              description="Your current weight is automatically taken from your latest weight progress entry."
            />

            <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
              <div>
                <p className="text-lg font-semibold text-text-primary">
                  {weightStats?.latest
                    ? `${weightStats.latest.weightKg} kg`
                    : "No entries yet"}
                </p>

                {weightStats?.latest && (
                  <p className="text-xs text-text-secondary">
                    Last logged {weightStats.latest.date}
                  </p>
                )}
              </div>

              <Link
                to="/progress"
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
              >
                Log weight
              </Link>
            </div>
          </section>

          {/* GOALS */}
          <section className="border-t border-border pt-8">
            <SectionHeader
              title="Goals"
              description="Choose your primary weight goal and preferred pace."
            />

            <div className="space-y-5">
              {/* GOAL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Goal
                </label>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {GOAL_OPTIONS.map((option) => {
                    const active = profile.goal === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleGoalChange(option.value)}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          active
                            ? "border-accent bg-accent text-background"
                            : "border-border bg-background text-text-secondary hover:border-accent/50 hover:text-text-primary"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PACE */}
              {profile.goal && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Pace
                  </label>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {SPEED_OPTIONS[profile.goal].map((option) => {
                      const active = profile.goalSpeed === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setProfile((previous) => ({
                              ...previous,
                              goalSpeed: option.value,
                            }))
                          }
                          className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                            active
                              ? "border-accent bg-accent text-background"
                              : "border-border bg-background text-text-secondary hover:border-accent/50 hover:text-text-primary"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {profile.goal === "maintain" && (
                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <p className="text-xs leading-5 text-text-secondary">
                    Maintenance mode doesn't require a weight-loss or
                    weight-gain pace.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* REQUIRED FIELDS WARNING */}
          {hasErrors && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
              Please fill in: {missingLabels.join(", ")} before saving.
            </div>
          )}

          {/* SAVE */}
          <div className="flex justify-end border-t border-border pt-8">
            <Button type="submit" disabled={saving || hasErrors}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
