import { useMemo } from 'react';
import { calculatePrayerTimes } from '../services/prayerTimes';
import { getMoonPosition, getSunMoonTimes } from '../services/astronomical';

interface AdminTimes {
  fajr?: Date;
  dhuhr?: Date;
  asr?: Date;
  maghrib?: Date;
  isha?: Date;
  tahajjud?: Date;
}

interface PrayerClockProps {
  userLatitude: number;
  userLongitude: number;
  currentTime: Date;
  city?: string;
  adminPrayerTimes?: AdminTimes;
}

const PRAYER_COLORS = {
  midnight: '#a855f7',
  tahajjud: '#ec4899',
  astronomicalDawn: '#3a4455',
  fajr: '#ef4444',
  sunrise: '#f97316',
  dhuhr: '#f97316',
  asr: '#22c55e',
  maghrib: '#3b82f6',
  isha: '#1e3a8a'
};

const PRAYER_LABEL_COLORS = {
  fajr: '#ef4444',
  dhuhr: '#f97316',
  jumuah: '#eab308',
  asr: '#22c55e',
  maghrib: '#3b82f6',
  isha: '#1e3a8a',
  tahajjud: '#ec4899'
};

const PRAYER_LABELS = {
  fajr: 'FAJR',
  dhuhr: 'ZUHR',
  jumuah: "JUMU'AH",
  asr: 'ASR',
  maghrib: 'MAGHRIB',
  isha: 'ISHA',
  tahajjud: 'TAHAJJUD'
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function timeToAngle(date: Date): number {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  return 90 + (totalMinutes / 1440) * 360;
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function createArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  const arcAngle = endAngle - startAngle;
  const normalizedArcAngle = arcAngle < 0 ? arcAngle + 360 : arcAngle;
  const largeArcFlag = normalizedArcAngle > 180 ? '1' : '0';

  return [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y,
    'Z'
  ].join(' ');
}

export default function PrayerClock({ userLatitude, userLongitude, currentTime, city, adminPrayerTimes }: PrayerClockProps) {
  const prayerTimes = useMemo(
    () => calculatePrayerTimes({ latitude: userLatitude, longitude: userLongitude }, currentTime),
    [userLatitude, userLongitude, currentTime]
  );

  const centerX = 300;
  const centerY = 300;
  const outerRadius = 220;
  const earthRadius = 180;

  const prayerSegments = useMemo(() => {
    const segments: Array<{ startAngle: number; endAngle: number; color: string; prayer: string }> = [];

    const timesArray = [
      { name: 'midnight', time: prayerTimes.midnight, color: PRAYER_COLORS.midnight },
      { name: 'tahajjud', time: prayerTimes.tahajjud, color: PRAYER_COLORS.tahajjud },
      { name: 'fajr', time: prayerTimes.fajr, color: PRAYER_COLORS.fajr },
      { name: 'sunrise', time: prayerTimes.sunrise, color: PRAYER_COLORS.sunrise },
      { name: 'dhuhr', time: prayerTimes.dhuhr, color: PRAYER_COLORS.dhuhr },
      { name: 'asr', time: prayerTimes.asr, color: PRAYER_COLORS.asr },
      { name: 'maghrib', time: prayerTimes.maghrib, color: PRAYER_COLORS.maghrib },
      { name: 'isha', time: prayerTimes.isha, color: PRAYER_COLORS.isha }
    ];

    for (let i = 0; i < timesArray.length; i++) {
      const current = timesArray[i];
      const next = timesArray[(i + 1) % timesArray.length];

      const startAngle = timeToAngle(current.time);
      let endAngle = timeToAngle(next.time);

      if (endAngle < startAngle) {
        endAngle += 360;
      }

      segments.push({
        startAngle,
        endAngle,
        color: current.color,
        prayer: current.name
      });
    }

    return segments;
  }, [prayerTimes]);

  const prayerLabelPositions = useMemo(() => {
    const positions: Array<{ x: number; y: number; label: string; time: string; angle: number; color: string }> = [];
    const labelRadius = outerRadius + 20;
    const jumuahRadius = outerRadius + 50;

    const jumuahTime = new Date(currentTime);
    jumuahTime.setHours(13, 30, 0, 0);

    const prayers = [
      { key: 'fajr', time: adminPrayerTimes?.fajr ?? prayerTimes.fajr },
      { key: 'dhuhr', time: adminPrayerTimes?.dhuhr ?? prayerTimes.dhuhr },
      { key: 'jumuah', time: jumuahTime },
      { key: 'asr', time: adminPrayerTimes?.asr ?? prayerTimes.asr },
      { key: 'maghrib', time: adminPrayerTimes?.maghrib ?? prayerTimes.maghrib },
      { key: 'isha', time: adminPrayerTimes?.isha ?? prayerTimes.isha },
      { key: 'tahajjud', time: adminPrayerTimes?.tahajjud ?? prayerTimes.tahajjud }
    ];

    prayers.forEach(prayer => {
      const angle = timeToAngle(prayer.time);
      const radius = prayer.key === 'jumuah' ? jumuahRadius : labelRadius;
      const pos = polarToCartesian(centerX, centerY, radius, angle);
      positions.push({
        x: pos.x,
        y: pos.y,
        label: PRAYER_LABELS[prayer.key as keyof typeof PRAYER_LABELS] || prayer.key.toUpperCase(),
        time: formatTime(prayer.time),
        angle,
        color: PRAYER_LABEL_COLORS[prayer.key as keyof typeof PRAYER_LABEL_COLORS]
      });
    });

    return positions;
  }, [prayerTimes, currentTime]);

  const hourMarkers = useMemo(() => {
    const markers: Array<{ x: number; y: number; label: string; isCardinal: boolean }> = [];

    for (let hour = 0; hour < 24; hour++) {
      const angle = 90 + (hour * 15);
      const radius = 195;
      const pos = polarToCartesian(centerX, centerY, radius, angle);
      const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
      const isCardinal = hour % 6 === 0;

      markers.push({
        x: pos.x,
        y: pos.y,
        label: displayHour.toString(),
        isCardinal
      });
    }

    return markers;
  }, []);


  const stars = useMemo(() => {
    const starArray = [];
    for (let i = 0; i < 150; i++) {
      starArray.push({
        x: Math.random() * 600,
        y: Math.random() * 600,
        r: Math.random() * 1.5 + 0.5
      });
    }
    return starArray;
  }, []);

  const currentTimeAngle = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    return 90 + (totalMinutes / 1440) * 360;
  }, [currentTime]);

  const sunAngle = useMemo(() => {
    return currentTimeAngle - 7.5;
  }, [currentTimeAngle]);

  const moonData = useMemo(() => {
    const sunMoonTimes = getSunMoonTimes(currentTime, userLatitude, userLongitude);

    let moonriseTime = sunMoonTimes.moonrise;
    let moonsetTime = sunMoonTimes.moonset;

    if (!moonriseTime || !moonsetTime) {
      return null;
    }

    if (moonsetTime < moonriseTime) {
      const yesterday = new Date(currentTime);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayTimes = getSunMoonTimes(yesterday, userLatitude, userLongitude);
      if (yesterdayTimes.moonrise) {
        moonriseTime = yesterdayTimes.moonrise;
      }
    }

    const currentMs = currentTime.getTime();
    const moonriseMs = moonriseTime.getTime();
    const moonsetMs = moonsetTime.getTime();

    const moonriseAngle = timeToAngle(moonriseTime);
    const moonsetAngle = timeToAngle(moonsetTime);

    const totalDuration = moonsetMs - moonriseMs;
    const elapsed = currentMs - moonriseMs;
    const progress = elapsed / totalDuration;

    let angleDiff = moonsetAngle - moonriseAngle;
    if (angleDiff < 0) {
      angleDiff += 360;
    }

    let moonAngle = moonriseAngle + progress * angleDiff;
    if (moonAngle >= 360) {
      moonAngle -= 360;
    }

    const isAboveHorizon = currentMs >= moonriseMs && currentMs <= moonsetMs;

    return {
      angle: moonAngle,
      isAboveHorizon,
      moonriseAngle,
      moonsetAngle,
      angleDiff,
      moonriseTime,
      moonsetTime
    };
  }, [currentTime, userLatitude, userLongitude]);

  const moonPhaseData = useMemo(() => {
    const moonPos = getMoonPosition(currentTime, userLatitude, userLongitude);
    return {
      phase: moonPos.phase,
      illumination: moonPos.illumination
    };
  }, [currentTime, userLatitude, userLongitude]);

  const userLocationOnEarth = useMemo(() => {
    const lat = userLatitude * Math.PI / 180;
    const lon = userLongitude * Math.PI / 180;

    const x = centerX + earthRadius * 0.7 * Math.cos(lat) * Math.cos(lon);
    const y = centerY - earthRadius * 0.7 * Math.sin(lat);

    return { x, y };
  }, [userLatitude, userLongitude, earthRadius]);

  const dayNightDivision = useMemo(() => {
    const sunriseAngle = timeToAngle(prayerTimes.sunrise);
    const sunsetAngle = timeToAngle(prayerTimes.maghrib);

    return { sunriseAngle, sunsetAngle };
  }, [prayerTimes]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0e1a]">
      <svg className="w-full h-full" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="sunGradient">
            <stop offset="0%" stopColor="#ffff99" />
            <stop offset="40%" stopColor="#ffeb3b" />
            <stop offset="70%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#ffcc00" />
          </radialGradient>

          <radialGradient id="earthGradient">
            <stop offset="0%" stopColor="#1a4d7a" />
            <stop offset="70%" stopColor="#0d2847" />
            <stop offset="100%" stopColor="#051629" />
          </radialGradient>

          <radialGradient id="dayGradient">
            <stop offset="0%" stopColor="#87ceeb" />
            <stop offset="50%" stopColor="#4a90c4" />
            <stop offset="100%" stopColor="#2a6b9e" />
          </radialGradient>

          <radialGradient id="nightGradient">
            <stop offset="0%" stopColor="#0d1f3d" />
            <stop offset="70%" stopColor="#071326" />
            <stop offset="100%" stopColor="#030a15" />
          </radialGradient>

          <clipPath id="earthClip">
            <circle cx={centerX} cy={centerY} r={earthRadius} />
          </clipPath>

          <clipPath id="dayClip">
            {(() => {
              const sunriseAngle = dayNightDivision.sunriseAngle;
              const sunsetAngle = dayNightDivision.sunsetAngle;
              const sunrisePos = polarToCartesian(centerX, centerY, earthRadius, sunriseAngle);
              const sunsetPos = polarToCartesian(centerX, centerY, earthRadius, sunsetAngle);

              const largeArcFlag = (sunsetAngle - sunriseAngle + 360) % 360 > 180 ? 1 : 0;

              return (
                <path d={`M ${centerX} ${centerY} L ${sunrisePos.x} ${sunrisePos.y} A ${earthRadius} ${earthRadius} 0 ${largeArcFlag} 1 ${sunsetPos.x} ${sunsetPos.y} Z`} />
              );
            })()}
          </clipPath>

          <clipPath id="nightClip">
            {(() => {
              const sunriseAngle = dayNightDivision.sunriseAngle;
              const sunsetAngle = dayNightDivision.sunsetAngle;
              const sunrisePos = polarToCartesian(centerX, centerY, earthRadius, sunriseAngle);
              const sunsetPos = polarToCartesian(centerX, centerY, earthRadius, sunsetAngle);

              const largeArcFlag = (sunriseAngle - sunsetAngle + 360) % 360 > 180 ? 1 : 0;

              return (
                <path d={`M ${centerX} ${centerY} L ${sunsetPos.x} ${sunsetPos.y} A ${earthRadius} ${earthRadius} 0 ${largeArcFlag} 1 ${sunrisePos.x} ${sunrisePos.y} Z`} />
              );
            })()}
          </clipPath>

          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {stars.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="#666666"
            opacity={Math.random() * 0.3 + 0.3}
          />
        ))}

        <circle
          cx={centerX}
          cy={centerY}
          r={earthRadius}
          fill="url(#dayGradient)"
          opacity="0.5"
          clipPath="url(#dayClip)"
        />

        <circle
          cx={centerX}
          cy={centerY}
          r={earthRadius}
          fill="url(#nightGradient)"
          opacity="0.5"
          clipPath="url(#nightClip)"
        />

        <circle
          cx={centerX}
          cy={centerY}
          r={earthRadius}
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="2"
        />

        <circle
          cx={userLocationOnEarth.x}
          cy={userLocationOnEarth.y}
          r="4"
          fill="#ff3333"
          stroke="#ffffff"
          strokeWidth="1"
        />

        {city && (
          <text
            x={userLocationOnEarth.x}
            y={userLocationOnEarth.y - 12}
            fill="#ffffff"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {city}
          </text>
        )}

        {[...Array(24)].map((_, hour) => {
          const angle = 90 + (hour * 15);
          const start = polarToCartesian(centerX, centerY, earthRadius, angle);
          const end = polarToCartesian(centerX, centerY, outerRadius, angle);
          return (
            <line
              key={hour}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#444"
              strokeWidth="1"
              opacity={0.4}
            />
          );
        })}

        {hourMarkers.map((marker, index) => (
          <text
            key={index}
            x={marker.x}
            y={marker.y}
            fill="white"
            fontSize={marker.isCardinal ? '16' : '14'}
            fontWeight={marker.isCardinal ? 'bold' : 'normal'}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {marker.label}
          </text>
        ))}

        {(() => {
          const prayerZones = [
            { start: prayerTimes.dhuhr,           end: prayerTimes.asr,              color: '#f97316', opacity: 0.22 },
            { start: prayerTimes.asr,             end: prayerTimes.maghrib,          color: '#22c55e', opacity: 0.25 },
            { start: prayerTimes.maghrib,         end: prayerTimes.isha,             color: '#38bdf8', opacity: 0.28 },
            { start: prayerTimes.isha,            end: prayerTimes.midnight,         color: '#6366f1', opacity: 0.30 },
            { start: prayerTimes.midnight,        end: prayerTimes.tahajjud,         color: '#0f172a', opacity: 0.55 },
            { start: prayerTimes.tahajjud,        end: prayerTimes.astronomicalDawn, color: '#c026d3', opacity: 0.28 },
            { start: prayerTimes.astronomicalDawn,end: prayerTimes.sunrise,          color: '#ef4444', opacity: 0.30 }
          ];

          return prayerZones.map((zone, i) => {
            let startAngle = timeToAngle(zone.start);
            let endAngle = timeToAngle(zone.end);
            if (endAngle < startAngle) endAngle += 360;
            const slicePath = createArc(centerX, centerY, earthRadius, startAngle, endAngle);
            return (
              <path
                key={i}
                d={slicePath}
                fill={zone.color}
                fillOpacity={zone.opacity}
                stroke="none"
              />
            );
          });
        })()}

        {(() => {
          const sunriseAngle = timeToAngle(prayerTimes.sunrise);
          const maghribAngle = timeToAngle(prayerTimes.maghrib);
          const sunriseEnd = polarToCartesian(centerX, centerY, earthRadius, sunriseAngle);
          const maghribEnd = polarToCartesian(centerX, centerY, earthRadius, maghribAngle);
          return (
            <g>
              <line
                x1={centerX} y1={centerY}
                x2={sunriseEnd.x} y2={sunriseEnd.y}
                stroke="#ffd700"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.85"
              />
              <line
                x1={centerX} y1={centerY}
                x2={maghribEnd.x} y2={maghribEnd.y}
                stroke="#ffd700"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>
          );
        })()}

        {(() => {
          const pointerEnd = polarToCartesian(centerX, centerY, earthRadius, currentTimeAngle);
          return (
            <g>
              <line
                x1={centerX}
                y1={centerY}
                x2={pointerEnd.x}
                y2={pointerEnd.y}
                stroke="#fbbf24"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.9"
              />
              <circle
                cx={pointerEnd.x}
                cy={pointerEnd.y}
                r="5"
                fill="#fbbf24"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text
                x={centerX}
                y={centerY - 20}
                fill="white"
                fontSize="13"
                fontWeight="600"
                textAnchor="middle"
                fontFamily="sans-serif"
                opacity="0.92"
              >
                Nahar
              </text>
              <text
                x={centerX}
                y={centerY - 6}
                fill="white"
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
                fontFamily="sans-serif"
                opacity="0.85"
              >
                (78:11, 35:13)
              </text>
              <text
                x={centerX}
                y={centerY + 14}
                fill="white"
                fontSize="13"
                fontWeight="600"
                textAnchor="middle"
                fontFamily="sans-serif"
                opacity="0.92"
              >
                Layl
              </text>
              <text
                x={centerX}
                y={centerY + 28}
                fill="white"
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
                fontFamily="sans-serif"
                opacity="0.85"
              >
                (25:47, 92:1)
              </text>
            </g>
          );
        })()}

        {(() => {
          const sunPos = polarToCartesian(centerX, centerY, 235, sunAngle);
          return (
            <g>
              <ellipse
                cx={sunPos.x}
                cy={sunPos.y}
                rx="31"
                ry="32"
                fill="url(#sunGradient)"
                filter="url(#glow)"
              />
              <text
                x={sunPos.x}
                y={sunPos.y - 5}
                fill="#000000"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                Shams
              </text>
              <text
                x={sunPos.x}
                y={sunPos.y + 8}
                fill="#000000"
                fontSize="10"
                fontWeight="normal"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                91
              </text>
              <text
                x={sunPos.x}
                y={sunPos.y - 48}
                fill="#ffeb3b"
                fontSize="13"
                fontWeight="bold"
                textAnchor="middle"
              >
                {formatTime(currentTime)}
              </text>
            </g>
          );
        })()}

        {moonData && (() => {
          const moonRadius = 140;
          const moonPos = polarToCartesian(centerX, centerY, moonRadius, moonData.angle);
          const moonSize = 18;
          const isAboveHorizon = moonData.isAboveHorizon;

          const moonPhaseName = (() => {
            if (moonPhaseData.phase < 0.0625) return 'New';
            if (moonPhaseData.phase < 0.1875) return 'Waxing Crescent';
            if (moonPhaseData.phase < 0.3125) return 'First Quarter';
            if (moonPhaseData.phase < 0.4375) return 'Waxing Gibbous';
            if (moonPhaseData.phase < 0.5625) return 'Full';
            if (moonPhaseData.phase < 0.6875) return 'Waning Gibbous';
            if (moonPhaseData.phase < 0.8125) return 'Last Quarter';
            if (moonPhaseData.phase < 0.9375) return 'Waning Crescent';
            return 'New';
          })();

          const shadowOffset = (moonPhaseData.illumination - 0.5) * 2;
          const createMoonPath = () => {
            const rightCurve = shadowOffset;
            return `
              M ${moonPos.x},${moonPos.y - moonSize}
              A ${moonSize},${moonSize} 0 0 1 ${moonPos.x},${moonPos.y + moonSize}
              A ${Math.abs(rightCurve * moonSize)},${moonSize} 0 0 ${rightCurve > 0 ? 1 : 0} ${moonPos.x},${moonPos.y - moonSize}
              Z
            `;
          };

          const moonrisePos = polarToCartesian(centerX, centerY, moonRadius, moonData.moonriseAngle);
          const moonsetPos = polarToCartesian(centerX, centerY, moonRadius, moonData.moonsetAngle);

          const largeArcFlag = moonData.angleDiff > 180 ? 1 : 0;

          return (
            <g>
              <defs>
                <clipPath id="moonClip">
                  <circle cx={moonPos.x} cy={moonPos.y} r={moonSize} />
                </clipPath>
              </defs>

              <path
                d={`M ${moonrisePos.x} ${moonrisePos.y} A ${moonRadius} ${moonRadius} 0 ${largeArcFlag} 1 ${moonsetPos.x} ${moonsetPos.y}`}
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />

              {(() => {
                const labelRadius = moonRadius - 22;
                const riseLabel = polarToCartesian(centerX, centerY, labelRadius, moonData.moonriseAngle);
                const setLabel  = polarToCartesian(centerX, centerY, labelRadius, moonData.moonsetAngle);
                const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <g>
                    <text x={riseLabel.x} y={riseLabel.y - 7} textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="600" opacity="0.9">Moon Rise</text>
                    <text x={riseLabel.x} y={riseLabel.y + 4} textAnchor="middle" fill="#cbd5e1" fontSize="8" opacity="0.85">{fmt(moonData.moonriseTime)}</text>
                    <text x={setLabel.x}  y={setLabel.y  - 7} textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="600" opacity="0.9">Moon Set</text>
                    <text x={setLabel.x}  y={setLabel.y  + 4} textAnchor="middle" fill="#cbd5e1" fontSize="8" opacity="0.85">{fmt(moonData.moonsetTime)}</text>
                  </g>
                );
              })()}

              <circle
                cx={moonPos.x}
                cy={moonPos.y}
                r={moonSize}
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1"
                opacity={isAboveHorizon ? 1 : 0.4}
              />
              <path
                d={createMoonPath()}
                fill="#e2e8f0"
                opacity={isAboveHorizon ? 0.95 : 0.4}
              />
              <circle
                cx={moonPos.x}
                cy={moonPos.y}
                r={moonSize}
                fill="none"
                stroke="#64748b"
                strokeWidth="1"
                opacity={isAboveHorizon ? 0.3 : 0.2}
              />
              <text
                x={moonPos.x}
                y={moonPos.y + 27}
                fill="#a0c4d8"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                opacity={isAboveHorizon ? 1 : 0.5}
              >
                Qamar - 54
              </text>
              <text
                x={moonPos.x}
                y={moonPos.y + 40}
                fill="#a0c4d8"
                fontSize="11"
                fontWeight="normal"
                textAnchor="middle"
                opacity={isAboveHorizon ? 1 : 0.5}
              >
                {moonPhaseName}
              </text>
            </g>
          );
        })()}

        {prayerLabelPositions.map((pos, index) => {
          return (
            <g key={index}>
              <text
                x={pos.x}
                y={pos.y - 8}
                fill={pos.color}
                fontSize="15"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {pos.label}
              </text>
              <text
                x={pos.x}
                y={pos.y + 8}
                fill={pos.color}
                fontSize="12"
                fontWeight="normal"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {pos.time}
              </text>
            </g>
          );
        })}

        {/* Shared defs for cosmic elements */}
        <defs>
          <radialGradient id="siriusGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#cce8ff" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#5ba8f5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1a6abf" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="galaxyCore" cx="40%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe8b0" stopOpacity="1" />
            <stop offset="40%" stopColor="#88aadd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1a3a6a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pulsarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="20%" stopColor="#aaddff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#2266cc" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0a1a4a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="maarijGlow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#88ccff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0a2040" stopOpacity="0" />
          </radialGradient>
          <filter id="siriusBlur">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="cosmicGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="pulsarBeam">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── TOP-LEFT CARD: Pulsar / Tariq (86:03) ── */}
        <g>
          <rect x="0" y="0" width="108" height="108" rx="10" ry="10"
            fill="#0a1628" fillOpacity="0.82"
            stroke="#2a4a7a" strokeWidth="1.2"
          />
          <text x="54" y="17" fill="white" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="sans-serif" opacity="0.95">Pulsar</text>
          <circle cx="54" cy="56" r="20" fill="url(#pulsarGlow)" opacity="0.55" />
          <circle cx="54" cy="56" r="10" fill="none" stroke="#aaddff" strokeWidth="1.2" opacity="0.7" />
          <circle cx="54" cy="56" r="6" fill="none" stroke="#ddeeff" strokeWidth="0.8" opacity="0.5" />
          <circle cx="54" cy="56" r="4" fill="#e8f4ff" filter="url(#cosmicGlow)" opacity="0.9" />
          <circle cx="54" cy="56" r="2.5" fill="#ffffff" />
          <line x1="54" y1="56" x2="79" y2="42" stroke="#aaddff" strokeWidth="1.8" opacity="0.75" filter="url(#pulsarBeam)" />
          <line x1="54" y1="56" x2="29" y2="70" stroke="#aaddff" strokeWidth="1.8" opacity="0.75" filter="url(#pulsarBeam)" />
          <line x1="54" y1="56" x2="83" y2="54" stroke="#88ccff" strokeWidth="1.2" opacity="0.55" filter="url(#pulsarBeam)" />
          <line x1="54" y1="56" x2="25" y2="58" stroke="#88ccff" strokeWidth="1.2" opacity="0.55" filter="url(#pulsarBeam)" />
          <line x1="54" y1="56" x2="75" y2="34" stroke="#cceeff" strokeWidth="0.8" opacity="0.4" />
          <line x1="54" y1="56" x2="33" y2="78" stroke="#cceeff" strokeWidth="0.8" opacity="0.4" />
          <text x="54" y="88" fill="white" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif" opacity="0.92">Tariq (86:03)</text>
        </g>

        {/* ── TOP-RIGHT CARD: Constellations / Buruj (85:01) ── */}
        <g>
          <rect x="492" y="0" width="108" height="108" rx="10" ry="10"
            fill="#0a1628" fillOpacity="0.82"
            stroke="#2a4a7a" strokeWidth="1.2"
          />
          <text x="546" y="17" fill="white" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="sans-serif" opacity="0.95">Constellations</text>
          <ellipse cx="546" cy="56" rx="22" ry="9" fill="url(#galaxyCore)" opacity="0.85" transform="rotate(-20,546,56)" />
          <ellipse cx="546" cy="56" rx="11" ry="4.5" fill="#ffe8c0" opacity="0.6" transform="rotate(-20,546,56)" />
          <path d="M 528 50 Q 537 44 546 56 Q 558 68 567 61" stroke="#7aaae0" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M 565 51 Q 555 44 546 56 Q 535 68 525 63" stroke="#7aaae0" strokeWidth="1.2" fill="none" opacity="0.6" />
          <circle cx="522" cy="36" r="1.4" fill="#cce8ff" opacity="0.9" />
          <circle cx="531" cy="31" r="1.2" fill="#cce8ff" opacity="0.8" />
          <circle cx="563" cy="33" r="1.4" fill="#cce8ff" opacity="0.9" />
          <circle cx="569" cy="41" r="1.2" fill="#cce8ff" opacity="0.8" />
          <circle cx="565" cy="74" r="1.2" fill="#cce8ff" opacity="0.7" />
          <line x1="522" y1="36" x2="531" y2="31" stroke="#cce8ff" strokeWidth="0.6" opacity="0.5" />
          <line x1="531" y1="31" x2="563" y2="33" stroke="#cce8ff" strokeWidth="0.6" opacity="0.5" />
          <line x1="563" y1="33" x2="569" y2="41" stroke="#cce8ff" strokeWidth="0.6" opacity="0.5" />
          <line x1="569" y1="41" x2="565" y2="74" stroke="#cce8ff" strokeWidth="0.6" opacity="0.5" />
          <text x="546" y="88" fill="white" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif" opacity="0.92">Buruj (85:01)</text>
        </g>

        {/* ── BOTTOM-LEFT CARD: Cosmic Ascents / Ma'arij + Isra ── */}
        <g>
          <rect x="0" y="492" width="108" height="108" rx="10" ry="10"
            fill="#0a1628" fillOpacity="0.82"
            stroke="#2a4a7a" strokeWidth="1.2"
          />
          <text x="54" y="509" fill="white" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="sans-serif" opacity="0.95">Cosmic Ascents</text>
          <path d="M 34 569 Q 54 559 74 569" stroke="#55aaff" strokeWidth="2.8" fill="none" opacity="0.35" />
          <path d="M 37 561 Q 54 551 71 561" stroke="#77bbff" strokeWidth="2.4" fill="none" opacity="0.45" />
          <path d="M 40 553 Q 54 543 68 553" stroke="#99ccff" strokeWidth="2" fill="none" opacity="0.55" />
          <path d="M 43 545 Q 54 535 65 545" stroke="#bbddff" strokeWidth="1.6" fill="none" opacity="0.65" />
          <path d="M 46 537 Q 54 528 62 537" stroke="#ddeeff" strokeWidth="1.2" fill="none" opacity="0.75" />
          <path d="M 49 530 Q 54 523 59 530" stroke="#eef6ff" strokeWidth="1" fill="none" opacity="0.85" />
          <line x1="54" y1="573" x2="54" y2="521" stroke="#88ccff" strokeWidth="1.2" opacity="0.4" filter="url(#cosmicGlow)" />
          <circle cx="54" cy="522" r="4" fill="url(#maarijGlow)" opacity="0.9" />
          <circle cx="54" cy="522" r="2.5" fill="#ffffff" opacity="0.95" />
          <text x="54" y="583" fill="white" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="sans-serif" opacity="0.92">Ma'arij (70:03-04)</text>
          <text x="54" y="596" fill="white" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="sans-serif" opacity="0.92">Isra (17:44)</text>
        </g>

        {/* ── BOTTOM-RIGHT CARD: Sirius / Najm (53:49) ── */}
        <g>
          <rect x="492" y="492" width="108" height="108" rx="10" ry="10"
            fill="#0a1628" fillOpacity="0.82"
            stroke="#2a4a7a" strokeWidth="1.2"
          />
          <text x="546" y="509" fill="white" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="sans-serif" opacity="0.95">Sirius</text>
          <circle cx="546" cy="547" r="18" fill="url(#siriusGlow)" opacity="0.6" />
          <circle cx="546" cy="547" r="6" fill="#e8f4ff" filter="url(#siriusBlur)" />
          <circle cx="546" cy="547" r="3.5" fill="#ffffff" />
          <line x1="546" y1="534" x2="546" y2="560" stroke="#cce8ff" strokeWidth="1.2" opacity="0.85" />
          <line x1="533" y1="547" x2="559" y2="547" stroke="#cce8ff" strokeWidth="1.2" opacity="0.85" />
          <line x1="537" y1="538" x2="555" y2="556" stroke="#cce8ff" strokeWidth="0.7" opacity="0.5" />
          <line x1="555" y1="538" x2="537" y2="556" stroke="#cce8ff" strokeWidth="0.7" opacity="0.5" />
          <text x="546" y="573" fill="white" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="sans-serif" opacity="0.92">Najm (53:49)</text>
        </g>

      </svg>
    </div>
  );
}
