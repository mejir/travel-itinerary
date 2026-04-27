import { useState } from 'react';

/**
 * Full-screen blocking modal shown on first visit.
 * Skipping is not allowed — a name is required to post comments.
 *
 * @param {{ onSubmit: (name: string) => void }} props
 */
export default function UserNameModal({ onSubmit }) {
  const [name, setName] = useState('');
  const trimmed = name.trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl animate-fade-in-up">

        {/* Header */}
        <p className="text-center text-4xl mb-2 select-none">✈️</p>
        <h1 className="text-center type-title text-[#1C1C1E] mb-1">表示名を設定</h1>
        <p className="text-center type-caption text-[#8E8E93] mb-1">
          あなたのお名前を教えてください。
        </p>
        <p className="text-center type-caption mb-5" style={{ color: '#007AFF' }}>
          後から変更できます
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="例：たろう"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 10))}
            maxLength={10}
            autoFocus
            autoComplete="nickname"
            className="w-full px-4 py-3 text-sm bg-[#F2F2F7] rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
          />
          <div className="flex justify-end">
            <span className="type-caption text-[#C7C7CC]">{trimmed.length} / 10</span>
          </div>
          <button
            type="submit"
            disabled={!trimmed}
            className="w-full font-semibold rounded-[14px] py-3.5 text-sm transition-opacity min-h-[52px]"
            style={{
              background: trimmed ? '#007AFF' : '#F2F2F7',
              color:      trimmed ? '#fff'    : '#C7C7CC',
            }}
          >
            はじめる
          </button>
        </form>
      </div>
    </div>
  );
}
