import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @returns {{
 *   status: 'idle'|'loading'|'ok'|'error',
 *   lat: number|null,
 *   lng: number|null,
 *   error: string|null,
 *   refresh: () => void,
 * }}
 */
export function useGeolocation() {
  const [state, setState] = useState({
    status: 'idle',
    lat: null,
    lng: null,
    error: null,
  });
  const watchIdRef = useRef(null);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'error', lat: null, lng: null, error: 'このブラウザはGeolocationに非対応です' });
      return;
    }
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    setState((s) => ({ ...s, status: 'loading' }));
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) =>
        setState({
          status: 'ok',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
        }),
      (err) =>
        setState({ status: 'error', lat: null, lng: null, error: err.message }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [start]);

  return { ...state, refresh: start };
}
