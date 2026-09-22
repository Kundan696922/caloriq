import { FiTarget } from "react-icons/fi";
import Card from "../common/Card";

export default function CalorieSummaryCard({ target, consumed, remaining }) {
  const pct =
    target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const over = remaining < 0;

  return (
    <Card className="flex flex-col items-center text-center">
      <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-text-secondary">
        <FiTarget size={14} className="text-accent" />
        DAILY CALORIES
      </div>

      <div className="text-4xl font-bold text-white">{Math.abs(remaining)}</div>

      <div className="mt-1 text-sm text-text-secondary">
        {over ? "calories over target" : "calories remaining"}
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all ${over ? "bg-red-500" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex w-full justify-between text-xs text-text-secondary">
        <span>{consumed} eaten</span>
        <span>{target} target</span>
      </div>
    </Card>
  );
}
