import { useMemo, useState } from "react";
import Card from "../common/Card";
import WeightRangeSelect from "../../components/common/WeightRangeSelect";

export default function WeightChart({ chart = [] }) {
  const [hovered, setHovered] = useState(null);
  const [range, setRange] = useState("30");

  const filteredChart = useMemo(() => {
    if (!chart.length) return [];

    const latestDate = new Date(chart[chart.length - 1].date);

    const days = {
      7: 7,
      30: 30,
      150: 150,
      365: 365,
    }[range];

    const cutoff = new Date(latestDate);
    cutoff.setDate(cutoff.getDate() - days);

    return chart.filter((entry) => {
      return new Date(entry.date) >= cutoff;
    });
  }, [chart, range]);

  if (filteredChart.length < 2) {
    return (
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-text-primary">
            Weight trend
          </h3>

          <WeightRangeSelect
            value={range}
            onChange={(value) => {
              setRange(value);
              setHovered(null);
            }}
          />
        </div>

        <p className="text-sm text-text-secondary">
          Log a few more entries to see your trend chart.
        </p>
      </Card>
    );
  }

  const width = 600;
  const height = 200;
  const padding = 24;

  const values = filteredChart.map((p) => Number(p.weightKg));

  const min = Math.min(...values);
  const max = Math.max(...values);

  const chartMin = min - 1;
  const chartMax = max + 1;
  const chartRange = chartMax - chartMin;

  const points = filteredChart.map((p, i) => {
    const weight = Number(p.weightKg);

    const x =
      padding + (i / (filteredChart.length - 1)) * (width - padding * 2);

    const y =
      height -
      padding -
      ((weight - chartMin) / chartRange) * (height - padding * 2);

    return {
      x,
      y,
      ...p,
      weightKg: weight,
    };
  });

  const lowest = Math.min(...filteredChart.map((p) => Number(p.weightKg)));

  const highest = Math.max(...filteredChart.map((p) => Number(p.weightKg)));

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Weight trend
        </h3>

        <WeightRangeSelect
          value={range}
          onChange={(value) => {
            setRange(value);
            setHovered(null);
          }}
        />
      </div>

      <div className="mb-4 flex gap-4 text-xs text-text-secondary">
        <span>
          Lowest: <strong className="text-text-primary">{lowest} kg</strong>
        </span>

        <span>
          Highest: <strong className="text-text-primary">{highest} kg</strong>
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full overflow-visible text-accent"
        >
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />

          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="currentColor"
              className="cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        {hovered !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-black px-3 py-2 text-xs text-white shadow-lg"
            style={{
              left: `${(points[hovered].x / width) * 100}%`,
              top: `${(points[hovered].y / height) * 100}%`,
            }}
          >
            <p className="font-medium">{points[hovered].date}</p>

            <p className="text-gray-300">{points[hovered].weightKg} kg</p>
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-between text-xs text-text-secondary">
        <span>{filteredChart[0].date}</span>
        <span>{filteredChart[filteredChart.length - 1].date}</span>
      </div>
    </Card>
  );
}
