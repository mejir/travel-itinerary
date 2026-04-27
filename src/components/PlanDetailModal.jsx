import { useRef, useState } from 'react';
import { formatDistance } from '../utils/haversine';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import ReactionsBar from './ReactionsBar';
import CommentSection from './CommentSection';

const STATUS_LABEL = { past: '通過済み', active: '進行中', next: '次の予定', future: '' };
const STATUS_STYLE = {
  past:   'bg-gray-100 text-gray-400',
  active: 'bg-blue-500 text-white font-bold',
  next:   'bg-blue-100 text-blue-600 font-bold',
  future: '',
};

/**
 * @param {{
 *   plan: object,
 *   status: 'past'|'active'|'next'|'future',
 *   distanceKm: number|null,
 *   tripId: string,
 *   userId: string,
 *   userName: string,
 *   onEdit: (plan: object) => void,
 *   onDelete: (id: string) => void,
 *   onClose: () => void,
 *   onUpdateReaction: (planId: string, emoji: string) => void,
 *   onAddComment: (planId: string, data: object) => void,
 * }} props
 */
export default function PlanDetailModal({
  plan,
  status,
  distanceKm,
  tripId,
  userId,
  userName,
  onEdit,
  onDelete,
  onClose,
  onUpdateReaction,
  onAddComment,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef(null);
  const { upload, uploading, photoError } = usePhotoUpload(tripId, plan.id);
  const isPast = status === 'past';

  /* ── Handlers ── */
  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(plan.id);
    onClose();
  }

  function handleEdit() {
    onEdit(plan);
    onClose();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so same file can be re-selected after a failed upload
    e.target.value = '';
    await upload(file);
  }

  function handleReact(emoji) {
    onUpdateReaction(plan.id, emoji);
  }

  function handleAddComment(text) {
    onAddComment(plan.id, { text, authorName: userName, authorId: userId });
  }

  /* ── Shared section divider ── */
  const Divider = () => <div className="h-px bg-gray-100 -mx-5" />;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[90svh] flex flex-col">

        {/* ── Handle ── */}
        <div className="shrink-0 flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* ── Header row ── */}
        <div className="shrink-0 flex items-center justify-between px-5 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{plan.category === '📍' ? '🔖' : (plan.category ?? '🔖')}</span>
            {STATUS_LABEL[status] && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_STYLE[status]}`}>
                {STATUS_LABEL[status]}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Photo area — full bleed */}
          {plan.photoUrl ? (
            <div className="relative">
              <img
                src={plan.photoUrl}
                alt=""
                loading="lazy"
                className="w-full object-cover"
                style={{ height: '192px' }}
              />
              {/* Upload overlay during re-upload */}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                  <div className="w-9 h-9 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                </div>
              )}
              {/* Change-photo button */}
              {!uploading && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 active:scale-95 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm transition-all"
                >
                  写真を変更
                </button>
              )}
            </div>
          ) : (
            /* Add-photo button */
            <div className="px-5 pt-2 pb-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-20 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-400 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
                    <span className="text-sm">アップロード中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">写真を追加</span>
                  </>
                )}
              </button>
              {photoError && (
                <p className="text-xs text-red-500 mt-1.5 px-1">{photoError}</p>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Padded content */}
          <div className="px-5 pt-3 pb-2 space-y-3">

            {/* Title + time */}
            <div>
              <h2 className={`text-xl font-bold leading-snug ${isPast ? 'text-gray-400' : 'text-gray-900'}`}>
                {plan.title}
              </h2>
              <p className="text-sm font-mono font-semibold text-blue-500 mt-0.5">{plan.time}</p>
            </div>

            {/* Location */}
            {plan.location && (
              <div className="flex items-start gap-3">
                <span className="shrink-0 text-gray-400 mt-0.5">📍</span>
                <p className="text-sm text-gray-700">{plan.location}</p>
              </div>
            )}

            {/* Distance (next plan only) */}
            {status === 'next' && distanceKm != null && (
              <div className="flex items-center gap-3">
                <span className="shrink-0 text-blue-400">📏</span>
                <p className="text-sm font-semibold text-blue-600">
                  現在地から直線 {formatDistance(distanceKm)}
                </p>
              </div>
            )}

            {/* Note */}
            {plan.note && (
              <div className="bg-gray-50 rounded-2xl p-3.5">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{plan.note}</p>
              </div>
            )}

            <Divider />

            {/* ── Reactions ── */}
            <section>
              <p className="text-xs font-semibold text-gray-400 mb-2">リアクション</p>
              <ReactionsBar
                reactions={plan.reactions ?? {}}
                userId={userId}
                onReact={handleReact}
              />
            </section>

            <Divider />

            {/* ── Comments ── */}
            <section className="pb-2">
              <p className="text-xs font-semibold text-gray-400 mb-2">みんなの一言</p>
              <CommentSection
                comments={plan.comments ?? []}
                userId={userId}
                onAddComment={handleAddComment}
              />
            </section>

          </div>
        </div>

        {/* ── Action buttons (pinned bottom) ── */}
        <div
          className="shrink-0 px-5 pt-3 border-t border-gray-100 flex gap-3"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.25rem)' }}
        >
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 rounded-2xl py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[52px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編集
          </button>
          <button
            onClick={handleDelete}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition-colors min-h-[52px] ${
              confirmDelete
                ? 'bg-red-500 text-white'
                : 'border border-red-200 text-red-500 hover:bg-red-50 active:bg-red-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {confirmDelete ? 'もう一度で確定' : '削除'}
          </button>
        </div>

      </div>
    </>
  );
}
