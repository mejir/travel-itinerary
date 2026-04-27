import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlans } from '../hooks/usePlans';
import { useTrip } from '../hooks/useTrip';
import { useGeolocation } from '../hooks/useGeolocation';
import { useWeather } from '../hooks/useWeather';
import { useReverseGeocode } from '../hooks/useReverseGeocode';
import { useNow } from '../hooks/useNow';
import WeatherBackground from '../components/WeatherBackground';
import WeatherHero from '../components/WeatherHero';
import DateTabs from '../components/DateTabs';
import Timeline from '../components/Timeline';
import PlanForm from '../components/PlanForm';
import PlanDetailModal from '../components/PlanDetailModal';
import TripEditModal from '../components/TripEditModal';
import ShareSheet from '../components/ShareSheet';
import { getDatesInRange, todayStr, timeToMinutes } from '../utils/dates';
import { saveRecentTrip } from '../utils/storage';
import { haversineKm } from '../utils/haversine';
import { getUserId, getUserName } from '../utils/user';

/* ── Helpers ── */
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}月${parseInt(d)}日`;
}

function formatShortPeriod(start, end) {
  const [, sm, sd] = start.split('-');
  const [, em, ed] = end.split('-');
  return `${parseInt(sm)}/${parseInt(sd)}〜${parseInt(em)}/${parseInt(ed)}`;
}

function calcPlanStatus(plan, selectedDate, nowMinutes, visiblePlans) {
  if (!selectedDate || selectedDate !== todayStr()) return 'future';
  const sorted = [...visiblePlans].sort((a, b) => a.time.localeCompare(b.time));
  const planMinutes = timeToMinutes(plan.time);
  if (planMinutes > nowMinutes) {
    const nextPlan = sorted.find((p) => timeToMinutes(p.time) > nowMinutes);
    return nextPlan?.id === plan.id ? 'next' : 'future';
  }
  const passed = sorted.filter((p) => timeToMinutes(p.time) <= nowMinutes);
  const activePlan = passed[passed.length - 1];
  return activePlan?.id === plan.id ? 'active' : 'past';
}

/* ── Skeleton ── */
function TimelineSkeleton() {
  return (
    <div className="space-y-3 animate-skeleton">
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 0 }}>
          <div style={{ width: 44, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', paddingRight: 10, paddingTop: 12 }}>
            <div style={{ width: 28, height: 10, borderRadius: 4, background: '#E5E5EA' }} />
          </div>
          <div style={{ width: 20, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#E5E5EA', flexShrink: 0 }} />
            {i < 2 && <div style={{ width: 1, flex: 1, marginTop: 3, minHeight: 40, background: '#F2F2F7' }} />}
          </div>
          <div style={{ flex: 1, marginLeft: 10, paddingBottom: 10 }}>
            <div style={{ borderRadius: 18, border: '1px solid #F2F2F7', background: '#F9F9F9', padding: '12px 14px' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: '#E5E5EA', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 13, background: '#E5E5EA', borderRadius: 4, width: '70%', marginBottom: 8 }} />
                  <div style={{ height: 10, background: '#F2F2F7', borderRadius: 4, width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Page ── */
export default function TripPage() {
  const { tripId } = useParams();
  const navigate   = useNavigate();
  const { trip, loading: tripLoading, updateTrip } = useTrip(tripId);
  const { plans, loading: plansLoading, error, addPlan, updatePlan, deletePlan, updateReaction, addComment } = usePlans(tripId);
  const userId   = useMemo(() => getUserId(), []);
  const userName = getUserName() ?? 'ゲスト';
  const { status: geoStatus, lat, lng, error: geoError, refresh: refreshGeo } = useGeolocation();
  const { data: weatherData, loading: weatherLoading } = useWeather(lat, lng, trip?.destination);
  const placeName = useReverseGeocode(lat, lng);
  const { nowMinutes, nowHHMM } = useNow();

  // Hour: recompute every minute so WeatherBackground transitions animate
  const [gradientHour, setGradientHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const id = setInterval(() => setGradientHour(new Date().getHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Fade-in on mount to prevent flash when navigating from HomePage
  const [pageOpacity, setPageOpacity] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPageOpacity(1));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const [selectedDate, setSelectedDate]     = useState(null);
  const [showForm, setShowForm]             = useState(false);
  const [editingPlan, setEditingPlan]       = useState(null);
  const [detailPlan, setDetailPlan]         = useState(null);
  const [showTripEdit, setShowTripEdit]     = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [slideDir, setSlideDir]             = useState('right');
  const prevDateIdxRef                      = useRef(-1);

  /* Derived */
  const tripDates =
    trip?.startDate && trip?.endDate
      ? getDatesInRange(trip.startDate, trip.endDate)
      : [];

  // Auto-select today's tab on first load
  useEffect(() => {
    if (selectedDate || tripDates.length === 0) return;
    const today   = todayStr();
    const initial = tripDates.includes(today) ? today : tripDates[0];
    prevDateIdxRef.current = tripDates.indexOf(initial);
    setSelectedDate(initial);
  }, [tripDates.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!trip || !tripId) return;
    saveRecentTrip({ tripId, name: trip.name ?? '旅のしおり', startDate: trip.startDate ?? null, endDate: trip.endDate ?? null });
  }, [trip, tripId]);

  const overlayOpen = showForm || !!editingPlan || !!detailPlan || showTripEdit || showShareSheet;
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [overlayOpen]);

  const visiblePlans =
    tripDates.length > 0 && selectedDate
      ? plans.filter((p) => p.date === selectedDate)
      : plans;

  const selectedDateIdx = selectedDate ? tripDates.indexOf(selectedDate) : -1;
  const prevDayPlan =
    selectedDateIdx > 0
      ? [...plans].filter((p) => p.date === tripDates[selectedDateIdx - 1]).sort((a, b) => b.time.localeCompare(a.time))[0] ?? null
      : null;
  const nextDayPlan =
    selectedDateIdx >= 0 && selectedDateIdx < tripDates.length - 1
      ? [...plans].filter((p) => p.date === tripDates[selectedDateIdx + 1]).sort((a, b) => a.time.localeCompare(b.time))[0] ?? null
      : null;

  // Live plan for detail modal — picks up reactions/comments/photos in real-time
  const livePlanDetail = detailPlan
    ? (plans.find((p) => p.id === detailPlan.id) ?? detailPlan)
    : null;

  const detailStatus = livePlanDetail
    ? calcPlanStatus(livePlanDetail, selectedDate, nowMinutes, visiblePlans)
    : 'future';

  const detailDistanceKm =
    (detailStatus === 'active' || detailStatus === 'next') &&
    lat != null && lng != null &&
    livePlanDetail?.locationLat != null && livePlanDetail?.locationLng != null
      ? haversineKm(lat, lng, livePlanDetail.locationLat, livePlanDetail.locationLng)
      : null;

  /* Handlers */
  async function handleAdd(data)    { await addPlan(data); setShowForm(false); }
  async function handleUpdate(data) { if (!editingPlan) return; await updatePlan(editingPlan.id, data); setEditingPlan(null); }
  async function handleTripSave(data) { await updateTrip(data); saveRecentTrip({ tripId, ...data }); }

  function openAdd()   { setEditingPlan(null); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditingPlan(null); }

  function handleDateSelect(date) {
    const newIdx  = tripDates.indexOf(date);
    const prevIdx = prevDateIdxRef.current;
    setSlideDir(prevIdx < 0 || newIdx >= prevIdx ? 'right' : 'left');
    prevDateIdxRef.current = newIdx;
    setSelectedDate(date);
  }

  const tripName = trip?.name ?? '旅のしおり';
  const loading  = tripLoading || plansLoading;

  return (
    <WeatherBackground
      weatherId={weatherData?.id ?? null}
      hours={gradientHour}
      className="flex flex-col h-svh overflow-hidden"
      style={{ opacity: pageOpacity, transition: 'opacity 0.2s ease' }}
    >

      {/* ── Gradient top area ── */}
      <div className="shrink-0">

        {/* Navigation bar */}
        <div className="flex items-center px-2 pt-12 pb-0 gap-1">
          {/* Back: iOS "‹ 旅程一覧" style */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-0.5 active:opacity-70 transition-opacity"
            style={{ minHeight: 44, minWidth: 44, paddingLeft: 6 }}
            aria-label="ホームへ戻る"
          >
            <svg width="11" height="19" fill="none" stroke="rgba(255,255,255,0.9)" viewBox="0 0 11 19">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.5 1L1 9.5 9.5 18" />
            </svg>
            <span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.9)', marginLeft: 3 }}>
              旅程一覧
            </span>
          </button>

          <div style={{ flex: 1 }} />

          {/* Share */}
          <button
            onClick={() => setShowShareSheet(true)}
            className="active:opacity-70 transition-opacity flex items-center justify-center"
            style={{ width: 44, height: 44 }}
            aria-label="旅程を共有"
          >
            <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.85)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          {/* Edit trip */}
          <button
            onClick={() => setShowTripEdit(true)}
            className="active:opacity-70 transition-opacity flex items-center justify-center"
            style={{ width: 44, height: 44 }}
            aria-label="旅程を編集"
          >
            <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.85)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        {/* Trip name (LargeTitle) + period */}
        <div style={{ padding: '4px 16px 2px' }}>
          <h1 className="type-large-title truncate" style={{ color: '#fff', lineHeight: 1.15 }}>
            {tripName}
          </h1>
          {trip?.startDate && trip?.endDate && (
            <p className="type-caption mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {formatShortPeriod(trip.startDate, trip.endDate)}
            </p>
          )}
        </div>

        {/* Weather pill */}
        <div style={{ paddingTop: 8 }}>
          <WeatherHero
            weather={weatherData}
            weatherLoading={weatherLoading}
            placeName={placeName}
            geoStatus={geoStatus}
            geoError={geoError}
            onRefresh={refreshGeo}
            destination={trip?.destination}
          />
        </div>

        {/* Date tabs */}
        {tripDates.length > 0 && (
          <DateTabs
            dates={tripDates}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
          />
        )}
      </div>

      {/* ── Timeline sheet (content-card) ── */}
      <div
        className="flex-1 overflow-hidden flex flex-col"
        style={{
          background: '#f2f2f7',
          borderRadius: '20px 20px 0 0',
        }}
      >
        {/* Sheet header */}
        <div
          className="shrink-0 flex items-center justify-between"
          style={{
            padding: '10px 16px 10px',
            borderBottom: '0.5px solid rgba(60,60,67,0.12)',
          }}
        >
          {/* Drag handle */}
          <div style={{ position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#C7C7CC' }} />
          </div>

          <p className="type-title text-[#1C1C1E]">
            {selectedDate ? `${formatShortDate(selectedDate)}の予定` : '全日程の予定'}
          </p>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 text-white font-semibold active:opacity-70 transition-opacity"
            style={{
              background: '#007AFF',
              borderRadius: 14,
              padding: '7px 14px',
              fontSize: 14,
              minHeight: 36,
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            追加
          </button>
        </div>

        {/* Scrollable timeline */}
        <div
          key={selectedDate ?? 'all'}
          className={`flex-1 overflow-y-auto px-3 pt-3 pb-4 ${
            slideDir === 'right' ? 'animate-slide-from-right' : 'animate-slide-from-left'
          }`}
        >
          {loading && <TimelineSkeleton />}

          {!loading && error && (
            <div
              style={{
                margin: '4px 4px',
                borderRadius: 18,
                background: '#FFF2F1',
                border: '1px solid rgba(255,59,48,0.15)',
                padding: '14px 16px',
                fontSize: 14,
                color: '#FF3B30',
              }}
            >
              エラー: {error}
            </div>
          )}

          {!loading && !error && (
            <Timeline
              plans={visiblePlans}
              selectedDate={selectedDate ?? todayStr()}
              nowMinutes={nowMinutes}
              nowHHMM={nowHHMM}
              userLat={lat}
              userLng={lng}
              onTap={setDetailPlan}
              onAdd={openAdd}
              prevDayPlan={prevDayPlan}
              nextDayPlan={nextDayPlan}
            />
          )}
        </div>
      </div>

      {/* ── Add / Edit form sheet ── */}
      {(showForm || editingPlan) && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeForm} />
          <div
            className="fixed bottom-0 inset-x-0 z-50 bg-white shadow-2xl animate-slide-up flex flex-col"
            style={{ borderRadius: '24px 24px 0 0', maxHeight: '92svh' }}
          >
            <div className="shrink-0 flex justify-center pt-3 pb-1">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#C7C7CC' }} />
            </div>
            <div className="shrink-0 flex items-center justify-between px-5 pb-3">
              <h2 className="type-title text-[#1C1C1E]">
                {editingPlan ? '予定を編集' : '予定を追加'}
              </h2>
              <button
                onClick={closeForm}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#8E8E93] hover:bg-[#F2F2F7] transition-colors"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-8">
              <PlanForm
                initial={editingPlan}
                defaultDate={selectedDate}
                tripDates={tripDates}
                onSubmit={editingPlan ? handleUpdate : handleAdd}
                onCancel={closeForm}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Plan detail modal ── */}
      {livePlanDetail && (
        <PlanDetailModal
          plan={livePlanDetail}
          status={detailStatus}
          distanceKm={detailDistanceKm}
          tripId={tripId}
          userId={userId}
          userName={userName}
          onEdit={(plan) => { setDetailPlan(null); setEditingPlan(plan); }}
          onDelete={(id) => { deletePlan(id); setDetailPlan(null); }}
          onClose={() => setDetailPlan(null)}
          onUpdateReaction={(planId, emoji) => updateReaction(planId, emoji, userId)}
          onAddComment={(planId, data) => addComment(planId, data)}
        />
      )}

      {/* ── Trip edit modal ── */}
      {showTripEdit && trip && (
        <TripEditModal
          trip={trip}
          onSave={handleTripSave}
          onClose={() => setShowTripEdit(false)}
        />
      )}

      {/* ── Share sheet ── */}
      {showShareSheet && (
        <ShareSheet
          tripUrl={window.location.href}
          tripName={trip?.name}
          startDate={trip?.startDate}
          endDate={trip?.endDate}
          onClose={() => setShowShareSheet(false)}
        />
      )}
    </WeatherBackground>
  );
}
