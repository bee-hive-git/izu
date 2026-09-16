import { useEffect, useState } from 'react';
import { authApi, type AdminSession } from '@/lib/api';

export function useAuth() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authApi.me()
      .then((currentSession) => {
        if (!cancelled) {
          setSession(currentSession);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { session, loading, setSession };
}
