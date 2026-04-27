import { useState, useEffect } from 'react';
import { CATEGORIES } from './PlanCard';

const EMPTY = { date: '', time: '', category: '🔖', title: '', location: '', note: '' };

/**
 * @param {{
 *   initial: object|null,
 *   defaultDate: string|null,
 *   tripDates: string[],
 *   onSubmit: (data: object) => void,
 *   onCancel: () => void,
 * }} props
 */
export default function PlanForm({ initial, defaultDate, tripDates, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initial) {
      setForm({
        date: initial.date ?? defaultDate ?? tripDates[0] ?? '',
        time: initial.time ?? '',
        category: initial.category ?? '🔖',
        title: initial.title ?? '',
        location: initial.location ?? '',
        note: initial.note ?? '',
      });
    } else {
      setForm({
        ...EMPTY,
        date: defaultDate ?? tripDates[0] ?? '',
      });
    }
  }, [initial, defaultDate, tripDates]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.time || !form.title) return;
    onSubmit(form);
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Date select */}
      {tripDates.length > 0 ? (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">日付</label>
          <select
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className={inputClass}
          >
            {tripDates.map((d) => {
              const [, m, day] = d.split('-');
              return (
                <option key={d} value={d}>
                  {parseInt(m)}月{parseInt(day)}日
                </option>
              );
            })}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">日付</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {/* Time + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            時刻 <span className="text-red-400">*</span>
          </label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => set('time', e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">種別</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map(({ emoji, label }) => (
              <option key={emoji} value={emoji}>
                {emoji} {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          タイトル <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="例：昼食"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">場所</label>
        <input
          type="text"
          placeholder="例：東京スカイツリー"
          value={form.location}
          onChange={(e) => set('location', e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">メモ</label>
        <textarea
          placeholder="備考・メモ"
          value={form.note}
          onChange={(e) => set('note', e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors min-h-[44px]"
        >
          {initial ? '保存する' : '追加する'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
