const KEY = 'travel-itinerary:recent';
const MAX = 10;

export function saveRecentTrip({ tripId, name, startDate, endDate }) {
  const trips = loadRecentTrips().filter((t) => t.tripId !== tripId);
  trips.unshift({ tripId, name, startDate, endDate, lastAccessed: Date.now() });
  try {
    localStorage.setItem(KEY, JSON.stringify(trips.slice(0, MAX)));
  } catch {
    // ignore QuotaExceededError
  }
}

export function loadRecentTrips() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteRecentTrip(tripId) {
  const trips = loadRecentTrips().filter((t) => t.tripId !== tripId);
  try {
    localStorage.setItem(KEY, JSON.stringify(trips));
  } catch {
    // ignore
  }
}
