import { useState } from 'react';

function formatTime(createdAt) {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Comment list + input form.
 * Comments are sorted ascending by createdAt.
 *
 * @param {{
 *   comments: Array<{ id: string, text: string, authorName: string, authorId: string, createdAt: number }>,
 *   userId: string,
 *   onAddComment: (text: string) => void,
 * }} props
 */
export default function CommentSection({ comments = [], userId, onAddComment }) {
  const [text, setText] = useState('');
  const trimmed = text.trim();

  const sorted = [...comments].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

  function handleSubmit(e) {
    e.preventDefault();
    if (!trimmed) return;
    onAddComment(trimmed);
    setText('');
  }

  return (
    <div className="space-y-3">

      {/* Comment list */}
      {sorted.length === 0 ? (
        <p className="text-center text-xs text-gray-300 py-1">まだコメントはありません</p>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((c) => {
            const isMe = c.authorId === userId;
            return (
              <div
                key={c.id}
                className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex flex-col max-w-[82%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Author + time */}
                  <div className="flex items-center gap-1.5 mb-0.5 px-1">
                    <span className={`text-[11px] font-semibold ${isMe ? 'text-blue-500' : 'text-gray-500'}`}>
                      {isMe ? 'あなた' : c.authorName}
                    </span>
                    <span className="text-[10px] text-gray-300">{formatTime(c.createdAt)}</span>
                  </div>
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-snug break-words ${
                      isMe
                        ? 'bg-blue-500 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    {c.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="一言メモを追加... (最大50文字)"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 50))}
          maxLength={50}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white min-h-[44px]"
        />
        <button
          type="submit"
          disabled={!trimmed}
          className="shrink-0 w-11 h-11 rounded-xl bg-blue-500 disabled:bg-gray-200 text-white flex items-center justify-center transition-colors active:scale-90"
          aria-label="送信"
        >
          {/* Paper-plane send icon */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
