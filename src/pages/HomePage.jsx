import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { loadRecentTrips, saveRecentTrip, deleteRecentTrip } from '../utils/storage';
import { formatDateTab } from '../utils/dates';
import { getUserName, setUserName } from '../utils/user';
import UserSettingsModal from '../components/UserSettingsModal';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatTripPeriod(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const s = formatDateTab(startDate).replace(/（.*）/, '');
  const e = formatDateTab(endDate).replace(/（.*）/, '');
  return `${s}〜${e}`;
}

const inputClass =
  'w-full rounded-[14px] border-none bg-[#F2F2F7] px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#007AFF]';

export default function HomePage() {
  const navigate = useNavigate();
  const [name, setName]           = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [creating, setCreating]   = useState(false);
  const [recentTrips, setRecentTrips] = useState(() => loadRecentTrips());
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [displayName, setDisplayName] = useState(() => getUserName() ?? '');

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;
    setCreating(true);
    try {
      const tripId = generateId();
      await setDoc(doc(db, 'trips', tripId), {
        name: name.trim(),
        startDate,
        endDate,
        createdAt: serverTimestamp(),
      });
      saveRecentTrip({ tripId, name: name.trim(), startDate, endDate });
      navigate(`/trip/${tripId}`);
    } finally {
      setCreating(false);
    }
  }

  function handleDeleteTrip(e, tripId) {
    e.stopPropagation();
    if (!window.confirm('この旅程をリストから削除しますか？\n（URLを知っていれば引き続きアクセス可能です）')) return;
    deleteRecentTrip(tripId);
    setRecentTrips(loadRecentTrips());
  }

  function handleNameSaved(newName) {
    setUserName(newName);
    setDisplayName(newName);
  }

  function closeCreateSheet() {
    setShowCreateSheet(false);
    // Reset form
    setName('');
    setStartDate('');
    setEndDate('');
  }

  const avatarLetter = displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-svh flex flex-col overflow-hidden" style={{ background: 'linear-gradient(to bottom, #1565c0, #1e88e5, #64b5f6)' }}>

      {/* ── Gradient header ── */}
      <div className="px-4 pt-14 pb-6 text-white">
        {/* Nav row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="type-large-title text-white">旅のしおり</h1>
            <p className="type-caption mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
              みんなでリアルタイムに旅程を共有
            </p>
          </div>

          {/* Right side: ＋ button + user avatar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Create new trip */}
            <button
              onClick={() => setShowCreateSheet(true)}
              className="flex items-center justify-center active:opacity-70 transition-opacity"
              style={{
                width: 38, height: 38,
                borderRadius: '50%',
                background: '#007AFF',
                border: '2px solid rgba(255,255,255,0.3)',
                color: '#fff',
              }}
              aria-label="新しい旅程を作る"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* User avatar */}
            <button
              onClick={() => setShowUserSettings(true)}
              className="flex items-center justify-center active:opacity-70 transition-opacity"
              style={{
                width: 38, height: 38,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.4)',
                fontSize: 15,
                fontWeight: 700,
                color: '#fff',
              }}
              aria-label="ユーザー設定"
            >
              {avatarLetter}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content sheet ── */}
      <div
        className="flex-1 px-4 pt-6 pb-10"
        style={{
          background: '#FFFFFF',
          borderRadius: '24px 24px 0 0',
        }}
      >
        {/* ── Recent trips ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="type-title text-[#1C1C1E]">旅程リスト</h2>
          <span className="type-caption" style={{ color: '#8E8E93' }}>
            {recentTrips.length > 0 ? `${recentTrips.length}件` : ''}
          </span>
        </div>

        {recentTrips.length === 0 ? (
          /* ── Empty state ── */
          <div className="text-center py-14">
            <p style={{ fontSize: 52, marginBottom: 12 }}>🛫</p>
            <p className="type-body font-semibold text-[#1C1C1E] mb-1">旅程がまだありません</p>
            <p className="type-caption text-[#8E8E93] mb-6">ボタンを押して最初の旅程を作ろう</p>
            <button
              onClick={() => setShowCreateSheet(true)}
              className="inline-flex items-center gap-2 text-white font-semibold transition-opacity active:opacity-70"
              style={{
                background: '#007AFF',
                borderRadius: 14,
                padding: '12px 24px',
                fontSize: 15,
                minHeight: 48,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              旅程を作る
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTrips.map((trip) => {
              const period = formatTripPeriod(trip.startDate, trip.endDate);
              return (
                <div
                  key={trip.tripId}
                  className="flex items-center overflow-hidden"
                  style={{
                    borderRadius: 18,
                    border: '1px solid rgba(60,60,67,0.12)',
                    background: '#F9F9F9',
                  }}
                >
                  <button
                    onClick={() => navigate(`/trip/${trip.tripId}`)}
                    className="flex-1 text-left px-4 py-3.5 min-w-0 active:opacity-70 transition-opacity"
                    style={{ minHeight: 60 }}
                  >
                    <p className="type-body font-semibold text-[#1C1C1E] truncate">
                      {trip.name ?? '旅のしおり'}
                    </p>
                    {period && (
                      <p className="type-caption text-[#8E8E93] mt-0.5">{period}</p>
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => handleDeleteTrip(e, trip.tripId)}
                    className="shrink-0 w-10 self-stretch flex items-center justify-center transition-colors active:opacity-70"
                    style={{ color: '#C7C7CC' }}
                    aria-label="リストから削除"
                  >
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Chevron */}
                  <button
                    onClick={() => navigate(`/trip/${trip.tripId}`)}
                    className="shrink-0 w-9 self-stretch flex items-center justify-center active:opacity-70 transition-opacity"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <svg width="13" height="13" fill="none" stroke="#C7C7CC" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* "Add trip" row at bottom of list */}
            <button
              onClick={() => setShowCreateSheet(true)}
              className="w-full flex items-center justify-center gap-2 active:opacity-70 transition-opacity"
              style={{
                borderRadius: 18,
                border: '1.5px dashed rgba(0,122,255,0.3)',
                background: 'rgba(0,122,255,0.04)',
                padding: '14px 0',
                color: '#007AFF',
                fontSize: 14,
                fontWeight: 600,
                minHeight: 52,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              新しい旅程を作る
            </button>
          </div>
        )}
      </div>

      {/* ── Create trip bottom sheet ── */}
      {showCreateSheet && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeCreateSheet}
          />

          {/* Sheet */}
          <div
            className="fixed bottom-0 inset-x-0 z-50 bg-white shadow-2xl animate-slide-up flex flex-col"
            style={{ borderRadius: '24px 24px 0 0', maxHeight: '92svh' }}
          >
            {/* Handle */}
            <div className="shrink-0 flex justify-center pt-3 pb-1">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#C7C7CC' }} />
            </div>

            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 pb-3 pt-1">
              <h2 className="type-title text-[#1C1C1E]">新しい旅程を作る</h2>
              <button
                onClick={closeCreateSheet}
                className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
                style={{ color: '#8E8E93', background: '#F2F2F7' }}
                aria-label="閉じる"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-5 pb-8">
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="type-caption text-[#8E8E93]">
                      旅程名 <span style={{ color: '#FF3B30' }}>*</span>
                    </label>
                    <span className="type-caption" style={{ color: name.length >= 20 ? '#FF3B30' : '#C7C7CC' }}>
                      {name.length}/20
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="例：京都・大阪 春の旅"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={20}
                    required
                    className={inputClass}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block type-caption text-[#8E8E93] mb-1.5">
                      開始日 <span style={{ color: '#FF3B30' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (endDate && e.target.value > endDate) setEndDate(e.target.value);
                      }}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block type-caption text-[#8E8E93] mb-1.5">
                      終了日 <span style={{ color: '#FF3B30' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full text-white font-semibold transition-opacity active:opacity-70 disabled:opacity-50 mt-1"
                  style={{
                    background: '#007AFF',
                    borderRadius: 14,
                    padding: '14px 0',
                    fontSize: 16,
                    minHeight: 52,
                  }}
                >
                  {creating ? '作成中...' : '旅程を作る ✈️'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── User settings modal ── */}
      {showUserSettings && (
        <UserSettingsModal
          currentName={displayName}
          onSave={handleNameSaved}
          onClose={() => setShowUserSettings(false)}
        />
      )}
    </div>
  );
}
