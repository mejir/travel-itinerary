/**
 * Compact inline weather display — left-aligned under the trip title.
 * Row 1: temp  icon  description
 * Row 2: 📍 location  ↻
 */
export default function WeatherHero({
  weather,
  weatherLoading,
  placeName,
  geoStatus,
  onRefresh,
  destination,
}) {
  const showDestination = Boolean(destination);
  const locationLabel = showDestination
    ? destination
    : geoStatus === 'loading'
    ? '取得中...'
    : geoStatus === 'error'
    ? '取得失敗'
    : (placeName ?? '現在地');

  return (
    <div className="px-4 pb-3 select-none text-white">

      {/* Row 1: temp + icon + description */}
      <div className="flex items-center gap-2">
        {weatherLoading && !weather ? (
          <div
            className="animate-skeleton"
            style={{
              width: 80, height: 28, borderRadius: 6,
              background: 'rgba(255,255,255,0.25)',
            }}
          />
        ) : weather ? (
          <>
            <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1 }}>
              {weather.temp}°
            </span>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
              alt={weather.description}
              style={{ width: 28, height: 28, flexShrink: 0 }}
            />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1 }}>
              {weather.description}
            </span>
          </>
        ) : (
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>天気情報なし</span>
        )}
      </div>

      {/* Row 2: location + refresh */}
      <div className="flex items-center gap-1 mt-1">
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
          📍 {locationLabel}
        </span>
        {!showDestination && (
          <button
            onClick={onRefresh}
            aria-label="現在地を更新"
            className="active:opacity-70 transition-opacity flex items-center justify-center"
            style={{
              minWidth: 44, minHeight: 44,
              color: 'rgba(255,255,255,0.55)',
              flexShrink: 0,
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
