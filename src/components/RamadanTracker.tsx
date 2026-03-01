import { useState, useEffect } from 'react';
import { Calendar, Clock, Moon, Star, BookOpen, Sunrise, Sunset, CalendarDays, Sparkles } from 'lucide-react';
import {
  getCurrentRamadanInfo,
  getLaylatAlQadrProbabilities,
  getRamadanHistoricalEvents,
  getRamadanVerseForDay,
  getSehriDua,
  getIftarDua,
  type RamadanInfo,
  type RamadanVerse
} from '../services/ramadanService';
import { calculatePrayerTimes, formatTime } from '../services/prayerTimes';
import type { LocationData } from '../services/geolocation';
import RamadanPrayerTimesModal from './RamadanPrayerTimesModal';

interface RamadanTrackerProps {
  location: LocationData;
  currentTime: Date;
}

export default function RamadanTracker({ location, currentTime }: RamadanTrackerProps) {
  const [ramadanInfo, setRamadanInfo] = useState<RamadanInfo | null>(null);
  const [dailyVerse, setDailyVerse] = useState<RamadanVerse | null>(null);
  const [sehriCountdown, setSehriCountdown] = useState<string>('');
  const [iftarCountdown, setIftarCountdown] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const info = getCurrentRamadanInfo(currentTime);
    setRamadanInfo(info);
  }, [currentTime]);

  useEffect(() => {
    async function fetchVerse() {
      if (!ramadanInfo) return;
      const day = ramadanInfo.isRamadan ? ramadanInfo.currentDay : 1;
      const verse = await getRamadanVerseForDay(day);
      setDailyVerse(verse);
    }
    fetchVerse();
  }, [ramadanInfo]);

  useEffect(() => {
    if (!ramadanInfo?.isRamadan) return;

    const updateCountdowns = () => {
      const prayerTimes = calculatePrayerTimes(location, currentTime);
      const now = currentTime.getTime();
      const fajrTime = prayerTimes.fajr.getTime();
      const maghribTime = prayerTimes.maghrib.getTime();

      const sehriDiff = fajrTime - now;
      if (sehriDiff > 0 && sehriDiff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(sehriDiff / (1000 * 60 * 60));
        const minutes = Math.floor((sehriDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((sehriDiff % (1000 * 60)) / 1000);
        setSehriCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setSehriCountdown('N/A');
      }

      const iftarDiff = maghribTime - now;
      if (iftarDiff > 0 && iftarDiff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(iftarDiff / (1000 * 60 * 60));
        const minutes = Math.floor((iftarDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((iftarDiff % (1000 * 60)) / 1000);
        setIftarCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setIftarCountdown('N/A');
      }
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [ramadanInfo, location, currentTime]);

  if (!ramadanInfo) {
    return <div className="text-white">Loading Ramadan information...</div>;
  }

  const prayerTimes = calculatePrayerTimes(location, currentTime);
  const sehriDua = getSehriDua();
  const iftarDua = getIftarDua();
  const historicalEvents = getRamadanHistoricalEvents();
  const todayEvent = historicalEvents.find(e => e.day === ramadanInfo.currentDay);

  return (
    <div className="space-y-6">
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-3"
      >
        <CalendarDays className="w-6 h-6" />
        View Full Month Prayer Times Calendar
      </button>

      {!ramadanInfo.isRamadan && (
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2744] p-6 rounded-lg border border-[#2d4a6f]/60 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-blue-200" />
            <h2 className="text-2xl font-bold text-blue-100">Days Until Ramadan</h2>
          </div>
          <p className="text-5xl font-bold text-white mb-4">{ramadanInfo.daysUntilRamadan} Days</p>
          <p className="text-blue-100 text-lg">
            Ramadan {ramadanInfo.ramadanDates.year} AH begins on{' '}
            {ramadanInfo.ramadanDates.startDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}

      {ramadanInfo.isRamadan && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 p-4 rounded-lg border border-[#4a6b8f]/70 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-200" />
                <h3 className="text-lg font-bold text-blue-100">Current Day</h3>
              </div>
              <p className="text-4xl font-bold text-white">Day {ramadanInfo.currentDay}</p>
              <p className="text-blue-200 text-sm">of {ramadanInfo.totalDays}</p>
            </div>

            <div className="bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 p-4 rounded-lg border border-[#4a6b8f]/70 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-200" />
                <h3 className="text-lg font-bold text-blue-100">Remaining Days</h3>
              </div>
              <p className="text-4xl font-bold text-white">{ramadanInfo.remainingDays}</p>
              <p className="text-blue-200 text-sm">days left</p>
            </div>

            <div className="bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 p-4 rounded-lg border border-[#4a6b8f]/70 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-blue-200" />
                <h3 className="text-lg font-bold text-blue-100">Ramadan {ramadanInfo.currentHijriDate.hy} AH</h3>
              </div>
              <p className="text-lg font-bold text-white">
                {ramadanInfo.currentHijriDate.hd} Ramadan {ramadanInfo.currentHijriDate.hy}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 p-4 rounded-lg border border-[#4a6b8f]/70 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sunrise className="w-6 h-6 text-blue-200" />
                <h3 className="text-xl font-bold text-blue-100">Sehri Ends (Fajr)</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{formatTime(prayerTimes.fajr)}</p>
              <p className="text-blue-200">Time until Sehri ends: <span className="font-bold">{sehriCountdown}</span></p>
            </div>

            <div className="bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 p-4 rounded-lg border border-[#4a6b8f]/70 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sunset className="w-6 h-6 text-blue-200" />
                <h3 className="text-xl font-bold text-blue-100">Iftar Time (Maghrib)</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{formatTime(prayerTimes.maghrib)}</p>
              <p className="text-blue-200">Time until Iftar: <span className="font-bold">{iftarCountdown}</span></p>
            </div>
          </div>
        </>
      )}

      {!ramadanInfo.isRamadan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 p-4 rounded-lg border border-[#4a6b8f]/70 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sunrise className="w-6 h-6 text-blue-200" />
              <h3 className="text-xl font-bold text-blue-100">Sehri Time (Fajr)</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{formatTime(prayerTimes.fajr)}</p>
            <p className="text-blue-200 text-sm">Fasting begins before this time</p>
          </div>

          <div className="bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 p-4 rounded-lg border border-[#4a6b8f]/70 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sunset className="w-6 h-6 text-blue-200" />
              <h3 className="text-xl font-bold text-blue-100">Iftar Time (Maghrib)</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{formatTime(prayerTimes.maghrib)}</p>
            <p className="text-blue-200 text-sm">Break your fast at this time</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 p-4 rounded-lg border border-[#4a6b8f]/70 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-6 h-6 text-blue-200" />
            <h3 className="text-xl font-bold text-blue-100">Dua Before Fasting (Sehri)</h3>
          </div>
          <div className="space-y-2">
            <p className="text-2xl text-white font-arabic text-right leading-relaxed">{sehriDua.arabic}</p>
            <p className="text-sm text-blue-200 italic">{sehriDua.transliteration}</p>
            <p className="text-sm text-blue-100">{sehriDua.translation}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 p-4 rounded-lg border border-[#4a6b8f]/70 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-6 h-6 text-blue-200" />
            <h3 className="text-xl font-bold text-blue-100">Dua for Breaking Fast (Iftar)</h3>
          </div>
          <div className="space-y-2">
            <p className="text-2xl text-white font-arabic text-right leading-relaxed">{iftarDua.arabic}</p>
            <p className="text-sm text-blue-200 italic">{iftarDua.transliteration}</p>
            <p className="text-sm text-blue-100">{iftarDua.translation}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 p-6 rounded-lg border border-[#4a6b8f]/70 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Moon className="w-7 h-7 text-blue-200" />
          <h3 className="text-2xl font-bold text-blue-100">Salat al-Tarawih</h3>
        </div>
        <div className="space-y-4">
          <p className="text-blue-100 text-lg leading-relaxed">
            Tarawih is a special voluntary night prayer performed only during the month of Ramadan, after 'Isha and before Witr.
          </p>
          <p className="text-blue-200 font-semibold">
            Insha'Allah we will be praying 8 rak'ahs
          </p>
          <div>
            <p className="text-blue-100 font-semibold mb-2">Some benefits of this prayer:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Deep connection with the Qur'an</li>
              <li>Forgiveness of sins</li>
              <li>Discipline & spiritual endurance</li>
              <li>Community unity</li>
            </ul>
          </div>
          <div className="bg-[#0f2744]/60 p-4 rounded-lg border border-[#2d4a6f]/50 mt-4">
            <p className="text-white italic leading-relaxed mb-2">
              "Whoever stands (in prayer) during Ramadan with faith and seeking reward, his past sins will be forgiven."
            </p>
            <p className="text-blue-200 text-sm font-semibold">(Bukhari & Muslim)</p>
          </div>
        </div>
      </div>

      {ramadanInfo.isRamadan && ramadanInfo.currentDay >= 21 && (
        <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/30 p-6 rounded-lg border border-yellow-700/50 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-7 h-7 text-yellow-300" />
            <h3 className="text-2xl font-bold text-yellow-100">Laylat al-Qadr Probabilities</h3>
          </div>
          <p className="text-yellow-200 mb-4">Based on historical observations, these are the most likely nights:</p>
          <div className="grid grid-cols-5 gap-3">
            {getLaylatAlQadrProbabilities(ramadanInfo.currentDay).map(({ day, probability, isToday }) => (
              <div
                key={day}
                className={`p-3 rounded-lg text-center ${
                  isToday
                    ? 'bg-yellow-500 text-yellow-900 ring-4 ring-yellow-300'
                    : 'bg-yellow-900/50 text-yellow-100'
                }`}
              >
                <p className="text-2xl font-bold">{day}</p>
                <p className="text-xs">Night</p>
                <p className="text-lg font-bold mt-1">{probability}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {dailyVerse && (
        <div className={`p-6 rounded-lg border shadow-lg ${
          dailyVerse.revelationMessage
            ? 'bg-gradient-to-br from-yellow-900/50 to-amber-900/40 border-yellow-700/50'
            : 'bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 border-[#4a6b8f]/70'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {dailyVerse.revelationMessage ? (
              <Sparkles className="w-7 h-7 text-yellow-300" />
            ) : (
              <BookOpen className="w-7 h-7 text-blue-200" />
            )}
            <h3 className={`text-2xl font-bold ${
              dailyVerse.revelationMessage ? 'text-yellow-100' : 'text-blue-100'
            }`}>
              Daily Ramadan Verse
            </h3>
          </div>

          {dailyVerse.progress && (
            <div className="mb-3 flex items-center gap-2">
              <div className="flex-1 bg-[#0f2744]/60 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(parseInt(dailyVerse.progress.split(' ')[1]) / 25) * 100}%` }}
                />
              </div>
              <p className="text-sm text-blue-200 font-semibold whitespace-nowrap">
                {dailyVerse.progress}
              </p>
            </div>
          )}

          {dailyVerse.theme && (
            <p className={`text-sm font-semibold mb-3 ${
              dailyVerse.revelationMessage ? 'text-yellow-300' : 'text-blue-200'
            }`}>
              Theme: {dailyVerse.theme}
            </p>
          )}

          <div className="space-y-3">
            <p className={`text-3xl font-arabic text-right leading-relaxed ${
              dailyVerse.revelationMessage ? 'text-yellow-50' : 'text-white'
            }`}>
              {dailyVerse.arabic}
            </p>
            <p className={`text-lg border-t pt-3 ${
              dailyVerse.revelationMessage
                ? 'text-yellow-100 border-yellow-700'
                : 'text-blue-100 border-[#4a6b8f]'
            }`}>
              {dailyVerse.translation}
            </p>
            <p className={`text-sm font-semibold ${
              dailyVerse.revelationMessage ? 'text-yellow-300' : 'text-blue-200'
            }`}>
              {dailyVerse.reference}
            </p>
          </div>

          {dailyVerse.mysteryMessage && !dailyVerse.revelationMessage && (
            <div className="mt-4 p-4 bg-[#0f2744]/60 rounded-lg border border-[#2d4a6f]/50">
              <p className="text-blue-200 text-sm leading-relaxed italic">
                {dailyVerse.mysteryMessage}
              </p>
            </div>
          )}

          {dailyVerse.revelationMessage && (
            <div className="mt-6 p-5 bg-yellow-950/60 rounded-lg border-2 border-yellow-600/50 shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <h4 className="text-xl font-bold text-yellow-100">Laduni Knowledge Revealed</h4>
              </div>
              <p className="text-yellow-100 leading-relaxed whitespace-pre-line text-sm">
                {dailyVerse.revelationMessage}
              </p>
            </div>
          )}
        </div>
      )}

      {todayEvent && (
        <div className="bg-gradient-to-br from-[#2d4a6f]/60 to-[#1e3a5f]/50 p-6 rounded-lg border border-[#4a6b8f]/70 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-7 h-7 text-blue-200" />
            <h3 className="text-2xl font-bold text-blue-100">Historical Event Today</h3>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-white">{todayEvent.title}</p>
            {todayEvent.year && <p className="text-sm text-blue-200">{todayEvent.year}</p>}
            <p className="text-blue-100">{todayEvent.description}</p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2744] p-6 rounded-lg border border-[#2d4a6f]/60 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-7 h-7 text-blue-200" />
          <h3 className="text-2xl font-bold text-blue-100">Ramadan Calendar - Historical Events</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {historicalEvents.map((event) => (
            <div
              key={event.day}
              className={`p-4 rounded-lg border-2 transition-all duration-200 hover:translate-y-[-2px] ${
                ramadanInfo.isRamadan && event.day === ramadanInfo.currentDay
                  ? 'bg-[#3d6ba8]/70 border-blue-300/80 shadow-[0_8px_16px_rgba(0,0,0,0.3),0_0_20px_rgba(59,130,246,0.2)] ring-2 ring-blue-400/40'
                  : 'bg-[#2d4a6f]/60 border-[#4a6b8f]/70 shadow-[0_6px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]'
              }`}
            >
              <p className="text-2xl font-bold text-white mb-1">Day {event.day}</p>
              <p className="text-sm font-semibold text-blue-100 mb-1">{event.title}</p>
              {event.year && <p className="text-xs text-blue-200 mb-2">{event.year}</p>}
              <p className="text-xs text-gray-100">{event.description}</p>
            </div>
          ))}
        </div>
      </div>

      <RamadanPrayerTimesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        location={location}
        ramadanYear={ramadanInfo.currentHijriDate.hy}
      />
    </div>
  );
}
