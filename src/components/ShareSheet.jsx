import { useState } from 'react';

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(d)}`;
}

/**
 * Bottom-sheet share dialog.
 * @param {{ tripUrl: string, tripName?: string, startDate?: string, endDate?: string, onClose: () => void }} props
 */
export default function ShareSheet({ tripUrl, tripName, startDate, endDate, onClose }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(tripUrl);
    } catch {
      const el = document.createElement('input');
      el.value = tripUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => { setCopied(false); onClose(); }, 1500);
  }

  function handleLine() {
    const name = tripName ?? '旅のしおり';
    const period =
      startDate && endDate ? ` ${fmtDate(startDate)}〜${fmtDate(endDate)}` : '';
    const text = `【${name}${period}】\n旅のしおりを共有しました✈️\n${tripUrl}`;
    window.open(
      `https://line.me/R/msg/text/?${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer',
    );
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-2">
          <p className="text-sm font-semibold text-gray-700 mb-4">旅程を共有</p>
          <div className="flex gap-3">
            {/* Copy URL */}
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all min-h-[52px] ${
                copied
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  コピー済み
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  URLをコピー
                </>
              )}
            </button>

            {/* LINE */}
            <button
              onClick={handleLine}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#06C755] text-white text-sm font-medium hover:bg-[#05b34d] active:bg-[#04a045] transition-colors min-h-[52px]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 5.92 2 10.72c0 3.22 1.95 6.04 4.9 7.73-.09.65-.33 2.05-.38 2.36-.06.4.15.39.31.28.12-.08 1.98-1.32 2.77-1.86.78.11 1.59.17 2.4.17 5.52 0 10-3.92 10-8.72C22 5.92 17.52 2 12 2zm-3.63 11.29H6.96a.5.5 0 01-.5-.5V8.62a.5.5 0 011 0v3.67h1.91a.5.5 0 010 1zm1.38-.5a.5.5 0 01-1 0V8.62a.5.5 0 011 0v4.17zm5.03 0a.5.5 0 01-.87.33l-2.19-2.98v2.65a.5.5 0 01-1 0V8.62a.5.5 0 01.87-.33l2.19 2.97V8.62a.5.5 0 011 0v4.17zm2.52 0h-1.91a.5.5 0 01-.5-.5V8.62a.5.5 0 011 0v3.67h1.41v-1.5H16.1a.5.5 0 010-1h1.21v-1.17h-1.41a.5.5 0 01-.5-.5V8.62a.5.5 0 01.5-.5h1.91a.5.5 0 01.5.5v4.17a.5.5 0 01-.5.5z" />
              </svg>
              LINEで共有
            </button>
          </div>
        </div>
        <div style={{ height: 'max(env(safe-area-inset-bottom), 1.5rem)' }} />
      </div>
    </>
  );
}
