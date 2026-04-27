import { useState } from 'react';
import { setUserName } from '../utils/user';

/**
 * Bottom-sheet modal for changing the display name.
 *
 * @param {{
 *   currentName: string,
 *   onSave: (name: string) => void,
 *   onClose: () => void,
 * }} props
 */
export default function UserSettingsModal({ currentName, onSave, onClose }) {
  const [name, setName] = useState(currentName ?? '');
  const trimmed = name.trim();
  const hasChanged = trimmed !== (currentName ?? '').trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!trimmed) return;
    setUserName(trimmed);
    onSave(trimmed);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-[24px] shadow-2xl animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-[#C7C7CC]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          <h2 className="type-title text-[#1C1C1E]">表示名を変更</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#8E8E93] hover:bg-[#F2F2F7] transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 space-y-3">
          {/* Current avatar preview */}
          <div className="flex justify-center py-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold select-none"
              style={{ background: '#007AFF' }}
            >
              {trimmed[0]?.toUpperCase() ?? '?'}
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="type-caption text-[#8E8E93] block mb-1.5">表示名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 10))}
              maxLength={10}
              autoFocus
              autoComplete="nickname"
              className="w-full px-4 py-3 type-body bg-[#F2F2F7] rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            />
            <div className="flex justify-end mt-1">
              <span className="type-caption text-[#C7C7CC]">{trimmed.length} / 10</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pb-8">
            <button
              type="submit"
              disabled={!trimmed || !hasChanged}
              className="flex-1 font-semibold rounded-[14px] py-3 text-sm transition-opacity min-h-[52px]"
              style={{
                background: trimmed && hasChanged ? '#007AFF' : '#F2F2F7',
                color:      trimmed && hasChanged ? '#fff'    : '#C7C7CC',
              }}
            >
              保存
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[14px] py-3 text-sm font-semibold min-h-[52px] bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA] transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
