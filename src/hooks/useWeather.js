import { useState, useEffect, useRef } from 'react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const INTERVAL_MS = 60 * 60 * 1000;

function buildUrl(lat, lng, destination) {
  const base = 'https://api.openweathermap.org/data/2.5/weather';
  const common = `&appid=${API_KEY}&units=metric&lang=ja`;
  if (destination) return `${base}?q=${encodeURIComponent(destination)}${common}`;
  return `${base}?lat=${lat}&lon=${lng}${common}`;
}

/**
 * @param {number|null} lat
 * @param {number|null} lng
 * @param {string|null|undefined} destination  City name for destination weather (overrides lat/lng)
 * @returns {{ data: object|null, loading: boolean }}
 */
export function useWeather(lat, lng, destination) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const canFetch = API_KEY && (destination || (lat != null && lng != null));

  useEffect(() => {
    if (!canFetch) return;

    async function fetch_() {
      setLoading(true);
      try {
        const res = await fetch(buildUrl(lat, lng, destination));
        if (!res.ok) return;
        const json = await res.json();
        setData({
          temp:        Math.round(json.main.temp),
          feelsLike:   Math.round(json.main.feels_like),
          humidity:    json.main.humidity,
          description: json.weather[0].description,
          icon:        json.weather[0].icon,
          main:        json.weather[0].main,
          id:          json.weather[0].id,   // numeric weather condition code
        });
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    }

    fetch_();
    timerRef.current = setInterval(fetch_, INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [lat, lng, destination, canFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading };
}
