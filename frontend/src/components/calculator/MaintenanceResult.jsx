import Card from '../common/Card';

export default function MaintenanceResult({ result }) {
  if (!result) return null;

  return (
    <Card className="mt-6">
      <p className="text-sm text-text-secondary">Your estimated results</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-black/20 p-4">
          <p className="text-xs text-text-secondary">BMR</p>
          <p className="mt-1 text-2xl font-bold">{result.bmr.toLocaleString()}</p>
          <p className="text-xs text-text-secondary mt-0.5">kcal / day at rest</p>
        </div>
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-4">
          <p className="text-xs text-text-secondary">Maintenance (TDEE)</p>
          <p className="mt-1 text-2xl font-bold text-accent">{result.tdee.toLocaleString()}</p>
          <p className="text-xs text-text-secondary mt-0.5">kcal / day to maintain weight</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-text-secondary leading-relaxed">
        BMR (Basal Metabolic Rate) is the energy your body needs at complete rest. TDEE (Total
        Daily Energy Expenditure) factors in your activity level and estimates the calories you'd
        burn — and need to eat — to maintain your current weight. These are estimates, not
        medical advice.
      </p>
    </Card>
  );
}
