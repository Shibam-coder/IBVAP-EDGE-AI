'use client';

import { useState, useEffect } from 'react';
import { TelemetryData } from '../types';
import { fetchTelemetry } from '../lib/api';

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTelemetry() {
      try {
        const res = await fetchTelemetry();
        if (isMounted && res.success) {
          setTelemetry(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Telemetry load failed');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTelemetry();

    return () => {
      isMounted = false;
    };
  }, []);

  return { telemetry, loading, error };
}
