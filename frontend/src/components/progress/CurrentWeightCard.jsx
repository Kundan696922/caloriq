import {
  FiFlag,
  FiBarChart2,
  FiTrendingDown,
  FiTrendingUp,
  FiMinus,
} from "react-icons/fi";

import Card from "../common/Card";

function TrendIcon({ value }) {
  if (value === null || value === undefined) {
    return <FiMinus size={14} />;
  }

  if (value < 0) {
    return (
      <FiTrendingDown
        size={14}
        className="text-accent"
      />
    );
  }

  if (value > 0) {
    return (
      <FiTrendingUp
        size={14}
        className="text-red-500"
      />
    );
  }

  return <FiMinus size={14} />;
}

export default function CurrentWeightCard({ stats }) {
  if (!stats?.latest) {
    return (
      <Card className="text-center">
        <div className="mb-2 flex items-center justify-center gap-2 text-xs font-medium text-text-secondary">
          <FiBarChart2 size={14} className="text-accent" />
          CURRENT WEIGHT
        </div>

        <p className="text-sm text-text-secondary">
          No weight logged yet — add your first entry to start tracking.
        </p>
      </Card>
    );
  }

  const { latest, changes, goalProgress } = stats;
  const weekChange = changes?.last7Days?.perWeekKg;

  return (
    <Card className="flex flex-col items-center text-center">
      {/* Current Weight */}
      <div className="mb-2 flex items-center justify-center gap-2 text-xs font-medium text-text-secondary">
        <FiBarChart2 size={14} className="text-accent" />
        CURRENT WEIGHT
      </div>

      <div className="text-4xl font-bold text-white">
        {latest.weightKg} kg
      </div>

      {/* Weekly Trend */}
      <div className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
        <TrendIcon value={weekChange} />

        {weekChange === null || weekChange === undefined
          ? "Not enough data yet"
          : `${weekChange > 0 ? "+" : ""}${weekChange} kg/week`}
      </div>

      {/* Goal Progress */}
      {goalProgress && (
        <div className="mt-4 w-full">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-text-secondary">
            <span className="flex items-center gap-1.5">
              <FiFlag size={13} className="text-accent" />
              GOAL PROGRESS
            </span>

            <span>
              {Math.round(goalProgress.percentComplete)}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{
                width: `${Math.min(
                  Math.max(goalProgress.percentComplete, 0),
                  100
                )}%`,
              }}
            />
          </div>

          <div className="mt-2 flex w-full justify-between text-xs text-text-secondary">
            <span>{goalProgress.currentWeightKg} kg</span>

            <span>
              Goal:{" "}
              <strong className="font-medium text-text-primary">
                {goalProgress.goalWeightKg} kg
              </strong>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
