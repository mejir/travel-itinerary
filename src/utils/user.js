const USER_ID_KEY   = 'travel-itinerary:userId';
const USER_NAME_KEY = 'travel-itinerary:userName';

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Returns (and lazily creates) a persistent anonymous userId stored in localStorage. */
export function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

/** Returns the user's display name, or null if not yet set. */
export function getUserName() {
  return localStorage.getItem(USER_NAME_KEY);
}

/** Persists the user's display name and ensures a userId exists. */
export function setUserName(name) {
  localStorage.setItem(USER_NAME_KEY, name.trim());
  getUserId(); // ensure userId is created alongside
}
