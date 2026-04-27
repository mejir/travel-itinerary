export const CATEGORIES = [
  { emoji: '🚗', label: '移動・交通' },
  { emoji: '🏨', label: '宿泊・チェックイン' },
  { emoji: '🍽️', label: '食事・グルメ' },
  { emoji: '🎯', label: '観光・レジャー' },
  { emoji: '🛒', label: '買い出し・ショッピング' },
  { emoji: '♨️', label: '温泉・スパ' },
  { emoji: '🎌', label: '文化・体験' },
  { emoji: '🌿', label: '自然・アウトドア' },
  { emoji: '🔖', label: 'その他' },
];

/**
 * Tappable plan card — Apple design.
 * Shows a photo thumbnail (120 px) at the top when plan.photoUrl is set.
 *
 * @param {{
 *   plan: object,
 *   status: 'past'|'active'|'next'|'future',
 *   remainingLabel?: string|null,
 *   onTap: (plan: object) => void,
 * }} props
 */
export default function PlanCard({ plan, status, remainingLabel, onTap }) {
  // Normalise legacy '📍' that was once used for 'その他'
  const rawCat  = plan.category ?? '🔖';
  const category = rawCat === '📍' ? '🔖' : rawCat;
  const isPast   = status === 'past';
  const isActive = status === 'active';
  const isNext   = status === 'next';
  const hasPhoto = Boolean(plan.photoUrl);

  /* ─── Compact "次" card ─── */
  if (isNext) {
    const shortLabel = remainingLabel
      ? remainingLabel.replace('開始まで', 'あと')
      : null;
    return (
      <button
        type="button"
        onClick={() => onTap(plan)}
        className="w-full text-left active:opacity-70 transition-opacity"
        style={{
          borderRadius: 18,
          border: '1px solid rgba(60,60,67,0.12)',
          background: '#F2F2F7',
          padding: '10px 14px',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', flexShrink: 0 }}>次</span>
            <p
              className="truncate"
              style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.2px', color: '#1C1C1E' }}
            >
              {plan.title}
            </p>
          </div>
          {shortLabel && (
            <span
              className="shrink-0"
              style={{
                fontSize: 12, fontWeight: 600,
                color: '#007AFF',
                background: 'rgba(0,122,255,0.10)',
                borderRadius: 20,
                padding: '3px 10px',
              }}
            >
              {shortLabel}
            </span>
          )}
        </div>
      </button>
    );
  }

  /* ─── Standard card (active / past / future) ─── */
  const cardStyle = {
    borderRadius: 18,
    overflow: 'hidden',
    opacity: isPast ? 0.45 : 1,
    transition: 'opacity 0.2s',
    ...(isActive
      ? {
          border: '1.5px solid #3B82F6',
          borderLeft: '4px solid #3B82F6',
          background: '#DBEAFE',
        }
      : {
          border: '1px solid rgba(60,60,67,0.12)',
          background: '#FFFFFF',
        }),
  };

  return (
    <button
      type="button"
      onClick={() => onTap(plan)}
      className="w-full text-left active:opacity-70 transition-opacity"
      style={cardStyle}
    >
      {/* Photo thumbnail */}
      {hasPhoto && (
        <div style={{ overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
          <img
            src={plan.photoUrl}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      <div style={{ padding: '10px 14px' }}>
        {/* "現在" badge */}
        {isActive && (
          <div style={{ marginBottom: 6 }}>
            <span
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
                color: '#fff',
                background: '#007AFF',
                borderRadius: 20,
                padding: '2px 8px',
              }}
            >
              現在
            </span>
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Icon */}
          {isPast ? (
            <div
              style={{
                width: 32, height: 32, borderRadius: 10,
                background: '#F2F2F7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="#8E8E93" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <span style={{ fontSize: 24, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>
              {category}
            </span>
          )}

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 15, fontWeight: 500, letterSpacing: '-0.2px',
                lineHeight: 1.4,
                color: isPast ? '#8E8E93' : isActive ? '#007AFF' : '#1C1C1E',
              }}
            >
              {plan.title}
            </p>

            {plan.location && (
              <p
                className="truncate"
                style={{ fontSize: 12, color: '#8E8E93', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}
              >
                <span>📍</span>
                <span className="truncate">{plan.location}</span>
              </p>
            )}

            {plan.note && (
              <p
                style={{
                  fontSize: 12, color: '#8E8E93', marginTop: 4,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                  lineHeight: 1.5,
                }}
              >
                {plan.note}
              </p>
            )}

            {remainingLabel && (
              <p
                style={{
                  fontSize: 12, fontWeight: 500, marginTop: 5,
                  color: isActive ? '#007AFF' : '#8E8E93',
                }}
              >
                ⏱ {remainingLabel}
              </p>
            )}
          </div>

          {/* Chevron */}
          {!isPast && (
            <svg
              width="14" height="14"
              fill="none" stroke="#C7C7CC" viewBox="0 0 24 24"
              style={{ marginTop: 4, flexShrink: 0 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
