import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Pings the backend /api/health endpoint once on mount.
 * Used during initial setup to confirm the frontend and backend are wired together.
 */
export default function useHealthCheck() {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    let isMounted = true;

    api
      .get('/health')
      .then((res) => {
        if (!isMounted) return;
        setStatus('online');
        setDetails(res.data);
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus('offline');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { status, details };
}
