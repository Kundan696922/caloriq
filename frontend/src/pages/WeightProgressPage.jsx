import { useState } from "react";
import { FiActivity, FiAlertCircle } from "react-icons/fi";
import Card from "../components/common/Card";
import AddWeightPanel from "../components/progress/AddWeightPanel";
import CurrentWeightCard from "../components/progress/CurrentWeightCard";
import WeightChart from "../components/progress/WeightChart";
import WeightHistoryList from "../components/progress/WeightHistoryList";
import WeightCalendar, {
  toDateStr,
} from "../components/progress/WeightCalendar";
import useWeight from "../hooks/useWeight";

export default function WeightProgressPage() {
  const { stats, history, loading, error, addEntry, removeEntry } = useWeight();

  const todayStr = toDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center text-sm text-text-secondary">
        Loading your progress…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-16">
        <Card className="text-center">
          <FiAlertCircle className="mx-auto mb-3 text-accent" size={28} />
          <p className="text-sm text-text-secondary">{error}</p>
        </Card>
      </div>
    );
  }

  const existingEntry = history.find((e) => e.date === selectedDate) || null;


return (
  <div className="mx-auto max-w-6xl">
    <section className="relative overflow-hidden rounded-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* BACKGROUND IMAGE */}
      <img
        src="https://images.unsplash.com/photo-1709315957145-a4bad1feef28?auto=format&fit=crop&w=2000&q=85"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* CONTENT */}
      <div className="relative mx-auto w-full">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md">
          <FiActivity size={13} className="text-accent" />
          WEIGHT PROGRESS
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <CurrentWeightCard stats={stats} />

            <WeightCalendar
              entries={history}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            <AddWeightPanel
              date={selectedDate}
              todayStr={todayStr}
              existingEntry={existingEntry}
              onAdd={addEntry}
            />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <WeightChart chart={stats?.chart ?? []} />

            <WeightHistoryList entries={history} onDelete={removeEntry} />
          </div>
        </div>
      </div>
    </section>
  </div>
);

}
