/* ── Time period helpers ── */

function getTimePeriod(hour) {
  if (hour <  5) return 'pre-dawn';   // 0:00–4:59
  if (hour <  7) return 'dawn';       // 5:00–6:59
  if (hour < 12) return 'morning';    // 7:00–11:59
  if (hour < 17) return 'afternoon';  // 12:00–16:59
  if (hour < 19) return 'evening';    // 17:00–18:59
  return 'night';                      // 19:00–23:59
}

const TIME_GRADIENTS = {
  'pre-dawn':  ['#0a1628', '#1a2d5a'],
  'dawn':      ['#c94b4b', '#e8963a', '#2575b7'],
  'morning':   ['#1a3a6b', '#2575b7', '#5aa3e0'],
  'afternoon': ['#1565c0', '#1e88e5', '#64b5f6'],
  'evening':   ['#c94b4b', '#e8963a', '#f5c842'],
  'night':     ['#0f1f3d', '#1a3a6b', '#2d4a8a'],
};

/* ── Hex color utilities ── */

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
    .join('');
}

function darken(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const f = 1 - amount;
  return rgbToHex(r * f, g * f, b * f);
}

function desaturate(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const gray = (r + g + b) / 3;
  return rgbToHex(
    r + (gray - r) * amount,
    g + (gray - g) * amount,
    b + (gray - b) * amount,
  );
}

/* ── Weather code correction ── */

function applyWeatherCode(colors, weatherId) {
  if (!weatherId) return colors;

  // Thunderstorm (200–232): dark purple
  if (weatherId >= 200 && weatherId <= 232) return ['#1a1a2e', '#2d2d5a', '#4a4a8a'];

  // Drizzle (300–321) / Rain (500–531): grey-blue
  if (weatherId >= 300 && weatherId <= 531) return ['#2c3e50', '#3d5a73', '#4a6a80'];

  // Snow (600–622): medium blue — keeps white text readable
  if (weatherId >= 600 && weatherId <= 622) return ['#2e6494', '#4a84b0', '#6aa4d0'];

  // Atmosphere / Mist (700–781)
  if (weatherId >= 700 && weatherId <= 781) return ['#5a6a7a', '#7a8a9a', '#9aaabb'];

  // Clear (800): base time gradient as-is
  if (weatherId === 800) return colors;

  // Partly cloudy (801–802): 10% darker
  if (weatherId <= 802) return colors.map((c) => darken(c, 0.1));

  // Overcast (803–804): 20% darker + 30% desaturated
  if (weatherId <= 804) return colors.map((c) => desaturate(darken(c, 0.2), 0.3));

  return colors;
}

/* ── Public API ── */

/**
 * Compute a CSS linear-gradient string for the given weather id and hour.
 * Returns a string ready for use as `background` style.
 */
export function getGradientStyle(weatherId, hour) {
  const h = hour ?? new Date().getHours();
  const period = getTimePeriod(h);
  const base = TIME_GRADIENTS[period];
  const colors = applyWeatherCode(base, weatherId ?? null);
  return `linear-gradient(to bottom, ${colors.join(', ')})`;
}

/** @deprecated use getGradientStyle */
export function getGradientColors(weatherMain, hour) {
  const h = hour ?? new Date().getHours();
  return TIME_GRADIENTS[getTimePeriod(h)];
}

/** @deprecated use getGradientStyle */
export function colorsToStyle(colors) {
  return `linear-gradient(to bottom, ${colors.join(', ')})`;
}
