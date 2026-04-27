import { haversineKm, formatDistance } from '../utils/haversine';

/**
 * @param {{
 *   geoStatus: 'idle'|'loading'|'ok'|'error',
 *   lat: number|null,
 *   lng: number|null,
 *   geoError: string|null,
 *   weather: { temp: number, description: string, icon: string } | null,
 *   nextPlan: import('../hooks/usePlans').Plan | null,
 * }} props
 */
export default function LocationWeatherBar({ geoStatus, lat, lng, geoError, weather, nextPlan }) {
  const hasCoords = lat != null && lng != null;

  const nextPlanCoords =
    nextPlan &&
    nextPlan.locationLat != null &&
    nextPlan.locationLng != null
      ? { lat: nextPlan.locationLat, lng: nextPlan.locationLng }
      : null;

  const distance =
    hasCoords && nextPlanCoords
      ? haversineKm(lat, lng, nextPlanCoords.lat, nextPlanCoords.lng)
      : null;

  return (
    <div className="mx-4 mb-3 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-stretch divide-x divide-gray-100">
        {/* Location */}
        <div className="flex items-center gap-2 px-3 py-2.5 flex-1 min-w-0">
          <span className="text-base shrink-0">📍</span>
          <div className="min-w-0">
            {geoStatus === 'loading' || geoStatus === 'idle' ? (
              <span className="text-xs text-gray-400">現在地を取得中...</span>
            ) : geoStatus === 'error' ? (
              <span className="text-xs text-red-400 truncate block" title={geoError ?? ''}>
                取得失敗
              </span>
            ) : (
              <span className="text-xs text-gray-600 font-mono tabular-nums">
                {lat?.toFixed(4)}, {lng?.toFixed(4)}
              </span>
            )}
          </div>
        </div>

        {/* Weather */}
        {weather && (
          <div className="flex items-center gap-1.5 px-3 py-2.5 shrink-0">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
              alt={weather.description}
              className="w-8 h-8 -my-1"
            />
            <div>
              <p className="text-sm font-bold text-gray-700 leading-none">{weather.temp}°C</p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">{weather.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Next destination distance */}
      {nextPlan && (
        <div
          className={`px-3 py-2 border-t border-gray-100 flex items-center gap-2 ${
            distance != null ? 'bg-amber-50' : 'bg-gray-50'
          }`}
        >
          <span className="text-sm">🚩</span>
          <span className="text-xs text-gray-600">
            次の予定:{' '}
            <span className="font-semibold text-amber-700">{nextPlan.time} {nextPlan.title}</span>
            {nextPlan.location ? (
              <span className="text-gray-400"> ({nextPlan.location})</span>
            ) : null}
          </span>
          {distance != null && (
            <span className="ml-auto text-xs font-bold text-amber-600 shrink-0">
              直線 {formatDistance(distance)}
            </span>
          )}
          {distance == null && nextPlan.locationLat == null && hasCoords && nextPlan.location && (
            <span className="ml-auto text-xs text-gray-300 shrink-0">座標未設定</span>
          )}
        </div>
      )}
    </div>
  );
}
