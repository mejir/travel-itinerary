import { useState, useEffect } from 'react';

function computeNow() {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  return {
    nowMinutes: h * 60 + m,
    nowHHMM: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
  };
}

/**
 * Returns { nowMinutes, nowHHMM }, refreshed every `intervalMs` milliseconds.
 * Keeps timeline status / remaining-time labels in sync without manual calls.
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(computeNow);

  useEffect(() => {
    const id = setInterval(() => setNow(computeNow()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now; // { nowMinutes: number, nowHHMM: string }
}
