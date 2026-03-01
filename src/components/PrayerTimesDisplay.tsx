import { useState, useEffect } from 'react';
import { Moon, Sun, Sunrise, Sunset, Check, Star } from 'lucide-react';
import { PrayerTimes, formatTime, getNextPrayer } from '../services/prayerTimes';
import type { LocationData } from '../services/geolocation';
import { supabase } from '../lib/supabase';
import PrayerInfoModal from './PrayerInfoModal';
import { prayerInformation, PrayerInfo } from '../data/prayerInfo';

interface PrayerTimesDisplayProps {
  prayerTimes: PrayerTimes;
  currentTime: Date;
  location: LocationData;
}

function parseTimeToDate(timeString: string, baseDate: Date): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getCountdown(prayerTime: Date, currentTime: Date): string {
  const diff = prayerTime.getTime() - currentTime.getTime();
  if (diff <= 0) return '';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function PrayerTimesDisplay({ prayerTimes, currentTime, location }: PrayerTimesDisplayProps) {
  const [displayTimes, setDisplayTimes] = useState<PrayerTimes>(prayerTimes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerInfo | null>(null);

  useEffect(() => {
    loadPrayerTimes();

    const handleUpdate = () => loadPrayerTimes();
    window.addEventListener('prayerTimesUpdated', handleUpdate);
    return () => window.removeEventListener('prayerTimesUpdated', handleUpdate);
  }, [currentTime]);

  const loadPrayerTimes = async () => {
    try {
      const today = currentTime.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('mosque_prayer_times')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (error) {
        setDisplayTimes(prayerTimes);
        return;
      }

      if (data) {
        setDisplayTimes({
          fajr: parseTimeToDate(data.fajr_time, currentTime),
          sunrise: parseTimeToDate(data.sunrise_time, currentTime),
          dhuhr: parseTimeToDate(data.dhuhr_time, currentTime),
          asr: parseTimeToDate(data.asr_time, currentTime),
          maghrib: parseTimeToDate(data.maghrib_time, currentTime),
          isha: parseTimeToDate(data.isha_time, currentTime),
          midnight: data.midnight ? parseTimeToDate(data.midnight, currentTime) : prayerTimes.midnight,
          tahajjud: data.tahajjud ? parseTimeToDate(data.tahajjud, currentTime) : prayerTimes.tahajjud,
          astronomicalDawn: prayerTimes.astronomicalDawn,
        });
      } else {
        setDisplayTimes(prayerTimes);
      }
    } catch {
      setDisplayTimes(prayerTimes);
    }
  };

  const handlePrayerClick = (infoKey: string) => {
    const info = prayerInformation[infoKey];
    if (info) {
      setSelectedPrayer(info);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrayer(null);
  };

  const nextPrayerInfo = getNextPrayer(displayTimes, currentTime, location);
  const nextPrayerName = nextPrayerInfo?.name || '';

  const jumuahTime = new Date(currentTime);
  jumuahTime.setHours(13, 30, 0, 0);

  const prayers = [
    { name: 'Fajr', infoKey: 'Fajr', time: displayTimes.fajr, icon: Moon, emoji: '🌌', gradientColor: 'from-indigo-600 to-blue-800' },
    { name: 'Sunrise', infoKey: 'Sunrise', time: displayTimes.sunrise, icon: Sunrise, emoji: '🌅', gradientColor: 'from-orange-500 to-pink-600' },
    { name: 'Dhuhr', infoKey: 'Dhuhr', time: displayTimes.dhuhr, icon: Sun, emoji: '☀️', gradientColor: 'from-yellow-500 to-orange-500' },
    { name: 'Asr', infoKey: 'Asr', time: displayTimes.asr, icon: Sun, emoji: '🌇', gradientColor: 'from-amber-500 to-yellow-600' },
    { name: 'Maghrib', infoKey: 'Maghrib', time: displayTimes.maghrib, icon: Sunset, emoji: '🌆', gradientColor: 'from-red-500 to-orange-600' },
    { name: 'Isha', infoKey: 'Isha', time: displayTimes.isha, icon: Moon, emoji: '🌙', gradientColor: 'from-slate-700 to-blue-900' },
    { name: 'Midnight', infoKey: 'Midnight', time: displayTimes.midnight, icon: Moon, emoji: '🌃', gradientColor: 'from-slate-600 to-slate-800' },
    { name: 'Tahajjud', infoKey: 'Tahajjud', time: displayTimes.tahajjud, icon: Star, emoji: '⭐', gradientColor: 'from-blue-700 to-slate-800' },
  ];

  return (
    <>
      <div className="mt-3 md:mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {prayers.map((prayer) => {
            const isNext = prayer.name === nextPrayerName;
            const isCompleted = prayer.time < currentTime;
            const countdown = isNext ? getCountdown(prayer.time, currentTime) : '';
            const hasInfo = !!prayerInformation[prayer.infoKey];

            return (
              <div
                key={prayer.name}
                onClick={() => hasInfo && handlePrayerClick(prayer.infoKey)}
                className={`group relative bg-gradient-to-br rounded-xl p-6 transition-all duration-300 ${
                  isNext
                    ? 'from-emerald-700 to-teal-800 shadow-2xl shadow-emerald-500/50 border-2 border-yellow-400 scale-105'
                    : isCompleted
                    ? 'from-slate-700/50 to-slate-800/50 shadow-lg border border-slate-600 opacity-70'
                    : 'from-slate-700 to-slate-800 shadow-lg hover:shadow-2xl hover:scale-105 border border-yellow-500/80'
                } ${hasInfo ? 'cursor-pointer' : ''}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${prayer.gradientColor} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`} />

                <div className="relative z-10 text-center">
                  <div className="text-4xl md:text-5xl mb-3">
                    {prayer.emoji}
                  </div>
                  <h3 className={`text-lg md:text-xl font-bold mb-2 transition-colors ${
                    isNext
                      ? 'text-white'
                      : isCompleted
                      ? 'text-slate-400'
                      : 'text-yellow-400 group-hover:text-yellow-300'
                  }`}>
                    {prayer.name}
                  </h3>
                  <p className={`text-base md:text-lg font-semibold ${
                    isNext || !isCompleted ? 'text-white' : 'text-slate-400'
                  }`}>
                    {formatTime(prayer.time)}
                  </p>

                  {isCompleted && !isNext && (
                    <div className="flex items-center justify-center mt-2">
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}

                  {isNext && countdown && (
                    <div className="mt-3 pt-3 border-t border-emerald-400/30">
                      <p className="text-sm text-emerald-200 font-medium">Next Prayer</p>
                      <p className="text-lg font-bold text-white mt-1">{countdown}</p>
                    </div>
                  )}

                  {hasInfo && !isNext && (
                    <div className={`text-xs mt-2 ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                      Tap for info
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PrayerInfoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        prayerInfo={selectedPrayer}
      />
    </>
  );
}
