import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

/**
 * Pings the backend /api/health endpoint on mount (and on demand via retry).
 * Used to gate initial render until the backend responds — useful when the
 * backend is on a service that cold-starts (e.g. Render free tier).
 */
export default function useHealthCheck() {
  const [status, setStatus] = useState("checking");
  const [details, setDetails] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setStatus("checking");

    api
      .get("/health")
      .then((res) => {
        if (!isMounted) return;
        setStatus("online");
        setDetails(res.data);
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("offline");
      });

    return () => {
      isMounted = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setAttempt((prev) => prev + 1);
  }, []);

  return { status, details, retry };
}
