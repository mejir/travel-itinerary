import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * @param {string|undefined} tripId
 * @returns {{ trip: object|null, loading: boolean, updateTrip: (data: object) => Promise<void> }}
 */
export function useTrip(tripId) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    return onSnapshot(doc(db, 'trips', tripId), (snap) => {
      setTrip(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
  }, [tripId]);

  async function updateTrip(data) {
    if (!tripId) return;
    await updateDoc(doc(db, 'trips', tripId), data);
  }

  return { trip, loading, updateTrip };
}
