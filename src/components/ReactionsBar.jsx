import { useState, useRef } from 'react';

const EMOJIS = ['👍', '❤️', '😂', '😭', '🎉'];

/**
 * Row of 5 emoji reaction buttons.
 * Tapping triggers a spring-scale pop animation (1.0 → 1.18 → 1.0).
 * Active (user already reacted) buttons show blue highlight + count.
 *
 * @param {{
 *   reactions: Record<string, string[]>,
 *   userId: string,
 *   onReact: (emoji: string) => void,
 * }} props
 */
export default function ReactionsBar({ reactions = {}, userId, onReact }) {
  // Track per-emoji tap counter to restart the pop animation on each tap
  const [popKeys, setPopKeys] = useState({});
  const timerRef = useRef({});

  function handleReact(emoji) {
    // Increment key to force animation restart via remount
    setPopKeys((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    onReact(emoji);
  }

  return (
    <div className="flex items-center justify-around gap-1">
      {EMOJIS.map((emoji) => {
        const users  = reactions[emoji] ?? [];
        const count  = users.length;
        const active = users.includes(userId);

        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleReact(emoji)}
            className="flex flex-col items-center gap-0.5 py-2 px-2.5 select-none transition-colors active:opacity-70"
            style={{
              minWidth: 52,
              minHeight: 52,
              borderRadius: 18,
              background: active ? 'rgba(0,122,255,0.10)' : '#F2F2F7',
              border: active ? '1px solid rgba(0,122,255,0.25)' : '1px solid transparent',
            }}
          >
            {/* Emoji — re-keyed on each tap to restart the pop animation */}
            <span
              key={popKeys[emoji] ?? 0}
              style={{ fontSize: 22, lineHeight: 1, display: 'inline-block' }}
              className={popKeys[emoji] ? 'animate-reaction-pop' : ''}
            >
              {emoji}
            </span>

            {/* Count */}
            <span
              className="tabular-nums type-caption font-semibold"
              style={{
                color: active ? '#007AFF' : count > 0 ? '#8E8E93' : '#C7C7CC',
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
