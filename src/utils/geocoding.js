export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ja`,
      { headers: { 'User-Agent': 'travel-itinerary-app/1.0' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address ?? {};
    return (
      a.city ?? a.town ?? a.village ?? a.suburb ?? a.county ?? a.state ?? null
    );
  } catch {
    return null;
  }
}
