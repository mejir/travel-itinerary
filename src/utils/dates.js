const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * Safely convert any date-like value to a "YYYY-MM-DD" string using local time.
 * Handles: plain string, Firestore Timestamp (.toDate()), JS Date, seconds number.
 */
function toLocalDateStr(val) {
  if (!val) return null;
  // Already a YYYY-MM-DD string — use as-is
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // Firestore Timestamp object
  if (typeof val?.toDate === 'function') {
    const d = val.toDate();
    return localDateStr(d);
  }
  // Native Date object
  if (val instanceof Date) return localDateStr(val);
  // Numeric seconds (Firestore legacy)
  if (typeof val === 'number') return localDateStr(new Date(val * 1000));
  // Fallback: try parsing as string with local-time suffix
  if (typeof val === 'string') {
    const d = new Date(val.includes('T') ? val : val + 'T00:00:00');
    if (!isNaN(d.getTime())) return localDateStr(d);
  }
  return null;
}

function localDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDatesInRange(startDate, endDate) {
  const start = toLocalDateStr(startDate);
  const end   = toLocalDateStr(endDate);
  if (!start || !end) return [];

  const dates = [];
  const current = new Date(start + 'T00:00:00');
  const last    = new Date(end   + 'T00:00:00');
  if (isNaN(current.getTime()) || isNaN(last.getTime())) return [];

  while (current <= last) {
    dates.push(localDateStr(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function formatDateTab(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAYS[d.getDay()]}）`;
}

export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isToday(dateStr) {
  return todayStr() === dateStr;
}

export function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Format a minute-count as "◯分", "◯時間", or "◯時間◯分" */
export function formatDuration(totalMinutes) {
  if (totalMinutes <= 0) return '0分';
  if (totalMinutes < 60) return `${totalMinutes}分`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}時間` : `${h}時間${m}分`;
}
