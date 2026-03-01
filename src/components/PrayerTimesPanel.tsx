import { useState, useEffect } from 'react';
import { Clock, Compass, MapPin, Moon, Sun, Sunrise, Sunset, Calendar } from 'lucide-react';
import { calculatePrayerTimes, calculateQiblaDirection, calculateDistanceToKaaba, getNextPrayer, formatTime, formatCountdown, PrayerTimes } from '../services/prayerTimes';
import { getSunMoonTimes, getMoonPosition, getMoonPhaseName } from '../services/astronomical';
import { getIslamicDate, formatIslamicDate } from '../services/islamicCalendar';
import type { LocationData } from '../services/geolocation';
import MoonPhaseVisual from './MoonPhaseVisual';
import KaabaVisual from './KaabaVisual';
import IslamicOccasionCountdown from './IslamicOccasionCountdown';
import ClermontFoodPantryCard from './ClermontFoodPantryCard';

interface PrayerTimesPanelProps {
  location: LocationData;
  currentTime: Date;
}

export default function PrayerTimesPanel({ location, currentTime }: PrayerTimesPanelProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [distanceToKaaba, setDistanceToKaaba] = useState<number>(0);
  const [countdown, setCountdown] = useState<string>('');
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [sunMoonTimes, setSunMoonTimes] = useState<any>(null);
  const [moonPhase, setMoonPhase] = useState<string>('');
  const [moonIllumination, setMoonIllumination] = useState<number>(0);
  const [moonPhaseValue, setMoonPhaseValue] = useState<number>(0);
  const [islamicDate, setIslamicDate] = useState<string>('');

  useEffect(() => {
    const times = calculatePrayerTimes(location, currentTime);
    setPrayerTimes(times);

    const qibla = calculateQiblaDirection(location);
    setQiblaDirection(qibla);

    const distance = calculateDistanceToKaaba(location);
    setDistanceToKaaba(distance);

    const sunMoon = getSunMoonTimes(currentTime, location.latitude, location.longitude);
    setSunMoonTimes(sunMoon);

    const moonPos = getMoonPosition(currentTime, location.latitude, location.longitude);
    setMoonPhase(getMoonPhaseName(moonPos.phase));
    setMoonIllumination(moonPos.illumination);
    setMoonPhaseValue(moonPos.phase);

    const hijriDate = getIslamicDate(currentTime);
    setIslamicDate(formatIslamicDate(hijriDate));
  }, [location, currentTime]);

  useEffect(() => {
    const updateCountdown = () => {
      if (prayerTimes) {
        const next = getNextPrayer(prayerTimes, new Date(), location);
        if (next) {
          setNextPrayer(next.name);
          setCountdown(formatCountdown(next.timeUntil));
        }
      }
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes, location]);

  if (!prayerTimes || !sunMoonTimes) {
    return <div className="text-white">Loading prayer times...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6 rounded-lg shadow-2xl border border-slate-700 h-full">
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
          <h2 className="text-lg md:text-2xl font-bold">
            {location.city && `${location.city}, `}
            {location.state_province && `${location.state_province}, `}
            {location.country}
          </h2>
        </div>
        <p className="text-xs md:text-sm text-slate-400">
          {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
        </p>
      </div>

      <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <Calendar className="w-5 h-5 md:w-6 md:h-6" />
          <h3 className="text-base md:text-xl font-semibold">Islamic Calendar</h3>
        </div>
        <p className="text-lg md:text-2xl font-bold">{islamicDate}</p>
      </div>

      <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <Clock className="w-5 h-5 md:w-6 md:h-6" />
          <h3 className="text-base md:text-xl font-semibold">Next Prayer: {nextPrayer}</h3>
        </div>
        <p className="text-2xl md:text-3xl font-bold">{countdown}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/30 p-3 md:p-4 rounded-lg border border-amber-700/50 shadow-lg flex flex-col">
          <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
            <Compass className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
            <h3 className="text-sm md:text-base font-semibold text-amber-100">Qibla</h3>
          </div>
          <div className="flex flex-col items-center gap-1 md:gap-2 flex-grow justify-center">
            <KaabaVisual />
            <p className="text-xl md:text-3xl font-bold text-amber-100">{qiblaDirection.toFixed(1)}°</p>
            <p className="text-xs md:text-sm font-semibold text-amber-200 text-center">{(distanceToKaaba * 0.621371).toFixed(0)} miles</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/30 p-3 md:p-4 rounded-lg border border-blue-700/50 shadow-lg flex flex-col">
          <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
            <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-300" />
            <h3 className="text-sm md:text-base font-semibold text-blue-100">Moon Phase</h3>
          </div>
          <div className="flex flex-col items-center gap-1 md:gap-2 flex-grow justify-center">
            <MoonPhaseVisual illumination={moonIllumination} phase={moonPhaseValue} />
            <p className="text-lg md:text-xl font-bold text-blue-100">{(moonIllumination * 100).toFixed(1)}%</p>
            <p className="text-xs md:text-sm font-semibold text-blue-200 text-center">{moonPhase}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
        <h3 className="text-base md:text-xl font-bold mb-2 md:mb-3 border-b border-slate-700 pb-2">Astronomical Dawn</h3>
        <div className="flex justify-between items-center p-2 md:p-3 bg-indigo-900/30 rounded-lg border border-indigo-700/50">
          <span className="text-sm md:text-base font-semibold">Time</span>
          <span className="font-mono text-base md:text-lg">{formatTime(prayerTimes.astronomicalDawn)}</span>
        </div>
      </div>

      <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
        <h3 className="text-base md:text-xl font-bold mb-2 md:mb-3 border-b border-slate-700 pb-2">Sun & Moon</h3>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div className="bg-slate-800/50 p-2 md:p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <Sunrise className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
              <span className="text-xs md:text-sm font-semibold">Sunrise</span>
            </div>
            <p className="font-mono text-sm md:text-base">{formatTime(sunMoonTimes.sunrise)}</p>
          </div>

          <div className="bg-slate-800/50 p-2 md:p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <Sunset className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
              <span className="text-xs md:text-sm font-semibold">Sunset</span>
            </div>
            <p className="font-mono text-sm md:text-base">{formatTime(sunMoonTimes.sunset)}</p>
          </div>

          <div className="bg-slate-800/50 p-2 md:p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <Moon className="w-3 h-3 md:w-4 md:h-4 text-blue-300" />
              <span className="text-xs md:text-sm font-semibold">Moonrise</span>
            </div>
            <p className="font-mono text-sm md:text-base">
              {sunMoonTimes.moonrise ? formatTime(sunMoonTimes.moonrise) : 'N/A'}
            </p>
          </div>

          <div className="bg-slate-800/50 p-2 md:p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <Moon className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
              <span className="text-xs md:text-sm font-semibold">Moonset</span>
            </div>
            <p className="font-mono text-sm md:text-base">
              {sunMoonTimes.moonset ? formatTime(sunMoonTimes.moonset) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <IslamicOccasionCountdown currentDate={currentTime} />

      <ClermontFoodPantryCard />
    </div>
  );
}
