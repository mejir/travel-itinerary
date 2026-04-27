import { useEffect, useRef } from 'react';
import { formatDateTab, isToday } from '../utils/dates';

export default function DateTabs({ dates, selectedDate, onSelect }) {
  const containerRef = useRef(null);

  // Scroll selected tab into view on mount / change
  useEffect(() => {
    if (!containerRef.current || !selectedDate) return;
    const el = containerRef.current.querySelector('[data-selected="true"]');
    if (el) el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [selectedDate]);

  if (!dates || dates.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {dates.map((date) => {
        const selected = date === selectedDate;
        const today    = isToday(date);

        return (
          <button
            key={date}
            data-selected={selected}
            onClick={() => onSelect(date)}
            className="shrink-0 flex items-center gap-1 transition-all active:opacity-70"
            style={{
              borderRadius:    20,
              padding:         '7px 14px',
              minHeight:       36,
              fontSize:        13,
              fontWeight:      selected ? 600 : 400,
              letterSpacing:   '-0.2px',
              background:      selected ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.15)',
              color:           selected ? '#007AFF' : 'rgba(255,255,255,0.9)',
              border:          'none',
              cursor:          'pointer',
              whiteSpace:      'nowrap',
            }}
          >
            {formatDateTab(date)}
            {today && (
              <span
                style={{
                  fontSize:    10,
                  fontWeight:  600,
                  color:       selected ? '#007AFF' : 'rgba(255,255,255,0.65)',
                  marginLeft:  2,
                }}
              >
                今日
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
