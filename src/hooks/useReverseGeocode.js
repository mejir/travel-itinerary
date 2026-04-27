import { useState, useEffect } from 'react';
import { reverseGeocode } from '../utils/geocoding';

/**
 * @param {number|null} lat
 * @param {number|null} lng
 * @returns {string|null}
 */
export function useReverseGeocode(lat, lng) {
  const [placeName, setPlaceName] = useState(null);

  useEffect(() => {
    if (lat == null || lng == null) {
      setPlaceName(null);
      return;
    }
    let cancelled = false;
    reverseGeocode(lat, lng).then((name) => {
      if (!cancelled) setPlaceName(name);
    });
    return () => { cancelled = true; };
  }, [lat, lng]);

  return placeName;
}
