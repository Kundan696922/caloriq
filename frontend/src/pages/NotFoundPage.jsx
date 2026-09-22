import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="text-center py-24">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-text-secondary">This page doesn't exist.</p>
      <Link to="/" className="inline-block mt-6">
        <Button variant="secondary">Back home</Button>
      </Link>
    </div>
  );
}
