import { useEffect, useRef } from 'react';
import PlanCard from './PlanCard';
import { isToday, formatDuration, timeToMinutes } from '../utils/dates';
import { haversineKm } from '../utils/haversine';

/* ── Helpers ── */

function createdAtSec(plan) {
  const c = plan.createdAt;
  if (!c) return 0;
  if (typeof c === 'number') return c;
  if (typeof c.seconds === 'number') return c.seconds;
  return 0;
}

function getRemainingLabel(status, plan, nextPlan, nowMinutes) {
  if (status === 'past') return null;
  if (status === 'active') {
    if (!nextPlan) return null;
    const diff = timeToMinutes(nextPlan.time) - nowMinutes;
    if (diff <= 0) return null;
    return `次の予定まで${formatDuration(diff)}`;
  }
  const diff = timeToMinutes(plan.time) - nowMinutes;
  if (diff <= 0) return null;
  return `開始まで${formatDuration(diff)}`;
}

function buildItems(plans, selectedDate, nowMinutes) {
  const showNow = isToday(selectedDate);

  const sorted = [...plans].sort((a, b) => {
    const td = a.time.localeCompare(b.time);
    return td !== 0 ? td : createdAtSec(a) - createdAtSec(b);
  });

  let activePlanId = null;
  let nextPlanId   = null;
  let nextPlan     = null;

  if (showNow) {
    const passed = sorted.filter((p) => timeToMinutes(p.time) <= nowMinutes);
    activePlanId = passed.length > 0 ? passed[passed.length - 1].id : null;
    nextPlan   = sorted.find((p) => timeToMinutes(p.time) > nowMinutes) ?? null;
    nextPlanId = nextPlan?.id ?? null;
  }

  const items = [];
  let nowInserted = false;

  for (const plan of sorted) {
    const planMinutes = timeToMinutes(plan.time);

    if (showNow && !nowInserted && planMinutes > nowMinutes) {
      items.push({ type: 'now' });
      nowInserted = true;
    }

    let status;
    if (!showNow) {
      status = 'future';
    } else if (plan.id === activePlanId) {
      status = 'active';
    } else if (planMinutes <= nowMinutes) {
      status = 'past';
    } else if (plan.id === nextPlanId) {
      status = 'next';
    } else {
      status = 'future';
    }

    const remainingLabel = showNow
      ? getRemainingLabel(status, plan, status === 'active' ? nextPlan : null, nowMinutes)
      : null;

    items.push({ type: 'plan', plan, status, remainingLabel });
  }

  if (showNow && !nowInserted) {
    items.push({ type: 'now' });
  }

  return { items, activePlanId, nextPlanId };
}

/* ── Day-boundary components ── */

/** Thin separator line between days */
function DaySeparator() {
  return (
    <div
      style={{
        height: '0.5px',
        background: 'rgba(60,60,67,0.15)',
        margin: '6px 16px',
      }}
    />
  );
}

/** Ghost plan row — dimmed, no interaction indicator */
function GhostPlanRow({ plan }) {
  return (
    <div style={{ display: 'flex', gap: 0, padding: '2px 0' }}>
      {/* Time */}
      <div
        style={{
          width: 44, flexShrink: 0, textAlign: 'right',
          paddingRight: 10, paddingTop: 10,
          fontSize: 12, fontFamily: 'monospace', color: '#C7C7CC',
        }}
      >
        {plan.time}
      </div>
      {/* Dot col */}
      <div style={{ width: 20, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C7C7CC', flexShrink: 0 }} />
      </div>
      {/* Card */}
      <div style={{ flex: 1, marginLeft: 10, paddingBottom: 8 }}>
        <div
          style={{
            borderRadius: 14,
            border: '1px solid rgba(60,60,67,0.08)',
            background: '#F9F9F9',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>{plan.category === '📍' ? '🔖' : (plan.category ?? '🔖')}</span>
          <p style={{ fontSize: 14, color: '#8E8E93', fontWeight: 400 }} className="truncate">{plan.title}</p>
        </div>
      </div>
    </div>
  );
}

/** Small label shown above/below a ghost plan section */
function GhostLabel({ text, align }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        padding: '2px 16px',
      }}
    >
      <span style={{ fontSize: 11, color: '#C7C7CC' }}>{text}</span>
    </div>
  );
}

/* ── Main component ── */

/**
 * @param {{
 *   plans: object[],
 *   selectedDate: string|null,
 *   nowMinutes: number,
 *   nowHHMM: string,
 *   userLat: number|null,
 *   userLng: number|null,
 *   onTap: (plan: object) => void,
 *   onAdd: () => void,
 *   prevDayPlan?: object|null,
 *   nextDayPlan?: object|null,
 * }} props
 */
export default function Timeline({
  plans,
  selectedDate,
  nowMinutes,
  nowHHMM,
  userLat,
  userLng,
  onTap,
  onAdd,
  prevDayPlan,
  nextDayPlan,
}) {
  const scrollTargetRef = useRef(null);

  // Auto-scroll to active/next plan on mount or date change
  useEffect(() => {
    if (!scrollTargetRef.current) return;
    const timer = setTimeout(() => {
      scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  if (plans.length === 0 && !prevDayPlan && !nextDayPlan) {
    return (
      <div className="text-center py-16">
        <p style={{ fontSize: 40, marginBottom: 12 }}>🗺️</p>
        <p style={{ fontSize: 14, color: '#8E8E93' }}>この日の予定はまだありません</p>
        <button
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 text-white text-sm font-semibold transition-opacity active:opacity-70"
          style={{
            background: '#007AFF',
            borderRadius: 14,
            padding: '10px 20px',
            minHeight: 44,
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          予定を追加
        </button>
      </div>
    );
  }

  const nm = nowMinutes ?? (new Date().getHours() * 60 + new Date().getMinutes());
  const { items, activePlanId, nextPlanId } = buildItems(plans, selectedDate ?? '', nm);

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Previous day: label → ghost → separator ── */}
      {prevDayPlan && (
        <div style={{ opacity: 0.3 }}>
          <GhostLabel text="← 前日" align="left" />
          <GhostPlanRow plan={prevDayPlan} />
        </div>
      )}
      {prevDayPlan && <DaySeparator />}

      {/* ── Current day plans ── */}
      {items.map((item, idx) => {

        /* ── "Now here" line ── */
        if (item.type === 'now') {
          return (
            <div key="now-indicator" style={{ display: 'flex', alignItems: 'center', padding: '6px 0' }}>
              {/* Spacer matching time column */}
              <div style={{ width: 44, flexShrink: 0 }} />
              {/* Red dot + line + time */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0 }}>
                <div
                  className="animate-now-pulse"
                  style={{
                    width: 9, height: 9,
                    borderRadius: '50%',
                    background: '#FF3B30',
                    flexShrink: 0,
                    marginRight: 4,
                  }}
                />
                <div
                  className="animate-now-pulse"
                  style={{
                    flex: 1,
                    height: '0.5px',
                    background: '#FF3B30',
                  }}
                />
                <span
                  style={{
                    fontSize: 12, fontWeight: 600,
                    color: '#FF3B30',
                    flexShrink: 0,
                    paddingLeft: 6,
                    letterSpacing: '-0.2px',
                  }}
                >
                  {nowHHMM}
                </span>
              </div>
            </div>
          );
        }

        /* ── Plan row ── */
        const { plan, status, remainingLabel } = item;
        const isActive   = status === 'active';
        const isNext     = status === 'next';
        const isPast     = status === 'past';
        const isLastItem = idx === items.length - 1 && !nextDayPlan;
        const isScrollTarget = isActive || (!activePlanId && isNext);

        const distanceKm =
          (isActive || isNext) &&
          userLat != null && userLng != null &&
          plan.locationLat != null && plan.locationLng != null
            ? haversineKm(userLat, userLng, plan.locationLat, plan.locationLng)
            : null;

        return (
          <div
            key={plan.id}
            ref={isScrollTarget ? scrollTargetRef : null}
            style={{ display: 'flex', gap: 0 }}
            className="animate-fade-in-up"
          >
            {/* Time label */}
            <div
              style={{
                width: 44,
                flexShrink: 0,
                textAlign: 'right',
                paddingRight: 10,
                paddingTop: 12,
                fontSize: 12,
                fontFamily: 'monospace',
                fontWeight: isActive ? 600 : 400,
                color: isPast ? '#C7C7CC' : isActive ? '#007AFF' : '#8E8E93',
              }}
            >
              {plan.time}
            </div>

            {/* Dot + vertical line column */}
            <div style={{ width: 20, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12 }}>
              {isPast ? (
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#C7C7CC', flexShrink: 0 }} />
              ) : isActive ? (
                /* Pulsing dot with glow for active */
                <div style={{ position: 'relative', width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div
                    className="animate-ping"
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '50%',
                      background: '#007AFF',
                      opacity: 0.4,
                    }}
                  />
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#007AFF', position: 'relative', zIndex: 1 }} />
                </div>
              ) : isNext ? (
                <div style={{
                  width: 11, height: 11, borderRadius: '50%',
                  background: '#007AFF',
                  boxShadow: '0 0 0 3px rgba(0,122,255,0.2)',
                  flexShrink: 0,
                }} />
              ) : (
                <div style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: '#fff',
                  border: '1.5px solid #C7C7CC',
                  flexShrink: 0,
                }} />
              )}

              {/* Vertical connecting line */}
              {!isLastItem && (
                <div style={{
                  flex: 1,
                  marginTop: 3,
                  minHeight: 12,
                  width: '0.5px',
                  background: isPast ? '#E5E5EA' : isActive ? '#007AFF' : '#E5E5EA',
                }} />
              )}
            </div>

            {/* Card */}
            <div style={{ flex: 1, marginLeft: 10, paddingBottom: 10 }}>
              <PlanCard
                plan={plan}
                status={status}
                remainingLabel={remainingLabel}
                onTap={onTap}
              />
            </div>
          </div>
        );
      })}

      {/* ── Next day: separator → ghost → label ── */}
      {nextDayPlan && <DaySeparator />}
      {nextDayPlan && (
        <div style={{ opacity: 0.3 }}>
          <GhostPlanRow plan={nextDayPlan} />
          <GhostLabel text="翌日 →" align="right" />
        </div>
      )}
    </div>
  );
}
