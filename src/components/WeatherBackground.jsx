import { useRef, useEffect } from 'react';

// ─── Gradient map ────────────────────────────────────────────
const GRADIENTS = {
  'clear-dawn':    'linear-gradient(170deg, #e8673a, #c24b5a, #7a3a8a, #2a1a5a)',
  'clear-morning': 'linear-gradient(170deg, #58aef5, #2d8cd8, #1a72c0)',
  'clear-day':     'linear-gradient(170deg, #2da2f0, #1580d0, #0e62b0)',
  'clear-sunset':  'linear-gradient(170deg, #c84820, #d06818, #a0306a, #3c1a62)',
  'clear-night':   'linear-gradient(170deg, #0c1a3a, #091228, #060c1a)',
  'partly-day':    'linear-gradient(170deg, #4898d8, #3070b8, #2258a0)',
  'partly-night':  'linear-gradient(170deg, #141e38, #0e1628, #08101e)',
  'cloudy':        'linear-gradient(170deg, #6a7e96, #546070, #3e4c58)',
  'overcast':      'linear-gradient(170deg, #4e5c6a, #3c4850, #2c3840)',
  'fog':           'linear-gradient(170deg, #8e9aa4, #7a8890, #666e76)',
  'drizzle':       'linear-gradient(170deg, #56708a, #425668, #303e4c)',
  'rain':          'linear-gradient(170deg, #445e78, #324858, #22323e)',
  'heavy-rain':    'linear-gradient(170deg, #283848, #1c2c38, #121e28)',
  'rain-night':    'linear-gradient(170deg, #16202e, #101820, #0a1018)',
  'thunder':       'linear-gradient(170deg, #161220, #100e18, #0a0810)',
  'snow':          'linear-gradient(170deg, #8aaac4, #6e90ae, #567898)',
  'sleet':         'linear-gradient(170deg, #7890a8, #5e7888, #4a6270)',
};

// ─── Weather state detector ───────────────────────────────────
function getWeatherState(weatherId, hours) {
  const isDawn    = hours >= 4  && hours < 6;
  const isMorning = hours >= 6  && hours < 10;
  const isSunset  = hours >= 17 && hours < 20;
  const isNight   = hours >= 20 || hours < 4;

  if (weatherId === 800) {
    if (isDawn)    return 'clear-dawn';
    if (isMorning) return 'clear-morning';
    if (isSunset)  return 'clear-sunset';
    if (isNight)   return 'clear-night';
    return 'clear-day';
  }
  if (weatherId === 801 || weatherId === 802)
    return isNight ? 'partly-night' : 'partly-day';
  if (weatherId === 803 || weatherId === 804) return 'cloudy';
  if (weatherId >= 300 && weatherId < 400)    return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) {
    if (weatherId >= 502) return isNight ? 'rain-night' : 'heavy-rain';
    return isNight ? 'rain-night' : 'rain';
  }
  if (weatherId >= 200 && weatherId < 300) return 'thunder';
  if (weatherId >= 600 && weatherId < 700) {
    if (weatherId === 611 || weatherId === 612) return 'sleet';
    return 'snow';
  }
  if (weatherId >= 700 && weatherId < 800) return 'fog';
  return 'clear-day';
}

// ─── Particle helpers ─────────────────────────────────────────

function makeRain(container, count, heightRange, speedRange, opacity, color) {
  const [minH, maxH] = heightRange;
  const [minS, maxS] = speedRange;
  const c = color ?? `rgba(180,210,255,${opacity})`;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const h   = minH + Math.random() * (maxH - minH);
    const dur = minS + Math.random() * (maxS - minS);
    Object.assign(el.style, {
      position:       'absolute',
      left:           `${Math.random() * 110 - 5}%`,
      top:            '0',
      width:          '1px',
      height:         `${h}px`,
      background:     c,
      borderRadius:   '1px',
      animation:      `rain-fall ${dur}s linear infinite`,
      animationDelay: `${-(Math.random() * dur)}s`,
    });
    container.appendChild(el);
  }
}

function makeSnow(container, count) {
  for (let i = 0; i < count; i++) {
    const el  = document.createElement('span');
    const sz  = 8  + Math.random() * 6;
    const dur = 3  + Math.random() * 3;
    Object.assign(el.style, {
      position:       'absolute',
      left:           `${Math.random() * 100}%`,
      top:            '0',
      fontSize:       `${sz}px`,
      animation:      `snow-fall ${dur}s linear infinite`,
      animationDelay: `${-(Math.random() * dur)}s`,
      userSelect:     'none',
      pointerEvents:  'none',
    });
    el.textContent = '❄';
    container.appendChild(el);
  }
}

function addSunHalos(container, topPct) {
  [80, 130, 180].forEach((size, i) => {
    const ring = document.createElement('div');
    Object.assign(ring.style, {
      position:       'absolute',
      top:            `${topPct}%`,
      left:           '50%',
      width:          `${size}px`,
      height:         `${size}px`,
      borderRadius:   '50%',
      border:         `1px solid rgba(255,225,60,${0.2 - i * 0.05})`,
      transform:      'translate(-50%, -50%)',
      animation:      'pulse 3s ease-in-out infinite',
      animationDelay: `${i * 0.5}s`,
    });
    container.appendChild(ring);
  });
}

// ─── Sky population ───────────────────────────────────────────

function populateSky(skyEl, state) {
  skyEl.innerHTML = '';

  switch (state) {

    case 'clear-dawn':
    case 'clear-morning':
    case 'clear-day':
      addSunHalos(skyEl, 20);
      break;

    case 'clear-sunset': {
      const overlay = document.createElement('div');
      Object.assign(overlay.style, {
        position:     'absolute',
        top: '15%',   left: '15%',
        width: '200px', height: '60px',
        borderRadius: '30px',
        background:   'rgba(255,120,30,0.13)',
      });
      skyEl.appendChild(overlay);
      addSunHalos(skyEl, 22);
      break;
    }

    case 'clear-night':
    case 'partly-night': {
      const count = state === 'partly-night' ? 35 : 50;
      for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        const size = 1 + Math.random() * 2;
        const dur  = 1.5 + Math.random() * 2;
        Object.assign(star.style, {
          position:       'absolute',
          left:           `${Math.random() * 100}%`,
          top:            `${Math.random() * 60}%`,
          width:          `${size}px`,
          height:         `${size}px`,
          borderRadius:   '50%',
          background:     'rgba(255,255,255,0.85)',
          animation:      `twinkle ${dur}s ease-in-out infinite`,
          animationDelay: `${-(Math.random() * dur)}s`,
        });
        skyEl.appendChild(star);
      }
      break;
    }

    case 'partly-day':
    case 'cloudy': {
      const count = state === 'cloudy' ? 5 : 3;
      for (let i = 0; i < count; i++) {
        const cloud = document.createElement('div');
        const w   = 100 + Math.random() * 120;
        const dur = 18  + Math.random() * 20;
        Object.assign(cloud.style, {
          position:       'absolute',
          top:            `${8 + Math.random() * 35}%`,
          left:           `-${w}px`,
          width:          `${w}px`,
          height:         `${28 + Math.random() * 20}px`,
          borderRadius:   '50px',
          background:     `rgba(255,255,255,${0.15 + Math.random() * 0.15})`,
          filter:         'blur(10px)',
          animation:      `drift ${dur}s linear infinite`,
          animationDelay: `${-(Math.random() * dur)}s`,
        });
        skyEl.appendChild(cloud);
      }
      break;
    }

    case 'fog': {
      for (let i = 0; i < 8; i++) {
        const mist = document.createElement('div');
        const dur  = 4 + Math.random() * 4;
        Object.assign(mist.style, {
          position:       'absolute',
          top:            `${15 + i * 10}%`,
          left:           '-5%',
          width:          '110%',
          height:         '2px',
          background:     `rgba(255,255,255,${0.3 + Math.random() * 0.2})`,
          animation:      `mist ${dur}s ease-in-out infinite alternate`,
          animationDelay: `${-(Math.random() * dur)}s`,
        });
        skyEl.appendChild(mist);
      }
      break;
    }

    case 'drizzle':
      makeRain(skyEl, 16, [6, 10],  [1.2, 1.8],  0.28);
      break;
    case 'rain':
      makeRain(skyEl, 28, [7, 12],  [0.75, 1.1], 0.38);
      break;
    case 'heavy-rain':
      makeRain(skyEl, 42, [9, 14],  [0.55, 0.85], 0.46, 'rgba(180,210,255,.46)');
      break;
    case 'rain-night':
      makeRain(skyEl, 28, [7, 12],  [0.75, 1.1],  0.30);
      break;

    case 'thunder': {
      makeRain(skyEl, 30, [8, 13], [0.6, 0.9], 0.38, 'rgba(180,200,255,.38)');
      for (let i = 0; i < 3; i++) {
        const bolt = document.createElement('div');
        const dur  = 4 + Math.random() * 3;
        Object.assign(bolt.style, {
          position:       'absolute',
          left:           `${20 + Math.random() * 60}%`,
          top:            '5%',
          width:          '1.5px',
          height:         '70px',
          background:     'rgba(255,255,200,0.9)',
          filter:         'blur(0.5px)',
          clipPath:       'polygon(50% 0%, 0% 50%, 42% 50%, 0% 100%, 100% 42%, 58% 42%, 100% 0%)',
          animation:      `flash ${dur}s infinite`,
          animationDelay: `${-(Math.random() * dur)}s`,
        });
        skyEl.appendChild(bolt);
      }
      break;
    }

    case 'snow':
      makeSnow(skyEl, 20);
      break;
    case 'sleet':
      makeRain(skyEl, 20, [7, 11], [0.85, 1.2], 0.34);
      makeSnow(skyEl, 6);
      break;

    default:
      break;
  }
}

// ─── Component ───────────────────────────────────────────────

export default function WeatherBackground({ weatherId, hours, className, style, children }) {
  const skyRef = useRef(null);
  const h      = hours ?? new Date().getHours();
  const state  = weatherId != null ? getWeatherState(weatherId, h) : 'clear-day';
  const gradient = GRADIENTS[state] ?? GRADIENTS['clear-day'];

  useEffect(() => {
    const skyEl = skyRef.current;
    if (!skyEl) return;
    populateSky(skyEl, state);
    return () => { if (skyRef.current) skyRef.current.innerHTML = ''; };
  }, [state]);

  return (
    <div
      className={className}
      style={{
        background:  gradient,
        transition:  'background 0.8s ease',
        position:    'relative',
        overflow:    'hidden',
        ...style,
      }}
    >
      {/* sky-layer: z-index 1, clipped by parent overflow:hidden */}
      <div
        ref={skyRef}
        style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden', pointerEvents: 'none' }}
      />
      {/* content: z-index 2, fills flex layout */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}
