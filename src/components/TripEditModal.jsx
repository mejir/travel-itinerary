import { useState, useEffect } from 'react';

/**
 * @param {{
 *   trip: object,
 *   onSave: (data: { name: string, startDate: string, endDate: string, destination: string }) => Promise<void>,
 *   onClose: () => void,
 * }} props
 */
export default function TripEditModal({ trip, onSave, onClose }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destination, setDestination] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!trip) return;
    setName(trip.name ?? '');
    setStartDate(trip.startDate ?? '');
    setEndDate(trip.endDate ?? '');
    setDestination(trip.destination ?? '');
  }, [trip]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), startDate, endDate, destination: destination.trim() });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[90svh] flex flex-col">
        {/* Handle */}
        <div className="shrink-0 flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="shrink-0 flex items-center justify-between px-5 pb-3">
          <h2 className="font-bold text-gray-800">旅程を編集</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
          {/* Trip name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500">
                旅程名 <span className="text-red-400">*</span>
              </label>
              <span className={`text-xs ${name.length >= 20 ? 'text-red-400' : 'text-gray-400'}`}>
                {name.length}/20
              </span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              required
              placeholder="例：京都・大阪 春の旅"
              className={inputClass}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">開始日</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) setEndDate(e.target.value);
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">終了日</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Destination for weather */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              目的地
              <span className="ml-1 font-normal text-gray-400">（天気取得に使用・任意）</span>
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="例：Tokyo, Kyoto"
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">
              設定すると目的地の天気を表示します（英語推奨）
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-2xl py-3 text-sm transition-colors min-h-[52px]"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 border border-gray-200 text-gray-600 text-sm rounded-2xl hover:bg-gray-50 transition-colors min-h-[52px]"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
