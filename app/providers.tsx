'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/authStore';
import { fetchMe } from '@/lib/authApi';

export default function Providers({ children }: { children: React.ReactNode }) {
  const { setSession, accessToken } = useAuth();

  useEffect(() => {
    // Session already restored from localStorage by zustand persist — skip.
    if (accessToken) return;

    fetchMe()
      .then((data) => {
        setSession(
          useAuth.getState().accessToken ?? '',
          data.user,
          'tenant' in data ? data.tenant : null,
        );
      })
      .catch(() => {
        // Don't clear localStorage session on network failure.
        // The axios interceptor handles 401 → token refresh → clearSession.
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
