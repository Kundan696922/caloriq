import Card from '../components/common/Card';

export default function ComingSoonPage({ title, description }) {
  return (
    <div className="max-w-lg mx-auto text-center py-10">
      <Card>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
        <p className="mt-4 text-xs text-text-secondary">This is coming in a later build phase.</p>
      </Card>
    </div>
  );
}
