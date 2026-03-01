import { useState, useEffect } from 'react';
import { Sunrise, Sun, Sunset, Moon, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { calculatePrayerTimes } from '../services/prayerTimes';
import { getIslamicDate, formatIslamicDate } from '../services/islamicCalendar';
import PrayerInfoModal from './PrayerInfoModal';
import { prayerInformation, PrayerInfo } from '../data/prayerInfo';

interface PrayerTimesData {
  fajr_time: string | null;
  sunrise_time: string | null;
  dhuhr_time: string | null;
  asr_time: string | null;
  maghrib_time: string | null;
  isha_time: string | null;
  midnight: string | null;
  tahajjud: string | null;
}

const MOSQUE_LOCATION = {
  latitude: 28.5494,
  longitude: -81.7729,
  city: 'Clermont',
  state_province: 'FL',
  country: 'United States',
  postal_code: '34711',
  timezone: 'America/New_York'
};

export default function TodaysPrayerTimesCard() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerInfo | null>(null);

  useEffect(() => {
    loadPrayerTimes();

    // Update current time every second for countdown
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Refresh prayer times every 30 seconds to catch updates
    const interval = setInterval(() => {
      loadPrayerTimes();
    }, 30000);

    // Also refresh when window regains focus
    const handleFocus = () => {
      loadPrayerTimes();
    };
    window.addEventListener('focus', handleFocus);

    // Listen for prayer times updates from other components
    const handlePrayerTimesUpdate = () => {
      loadPrayerTimes();
    };
    window.addEventListener('prayerTimesUpdated', handlePrayerTimesUpdate);

    return () => {
      clearInterval(timeInterval);
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('prayerTimesUpdated', handlePrayerTimesUpdate);
    };
  }, []);

  const dateToTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  const loadPrayerTimes = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('mosque_prayer_times')
      .select('*')
      .eq('date', today)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      const calculated = calculatePrayerTimes(MOSQUE_LOCATION, new Date());

      const mergedTimes: PrayerTimesData = {
        fajr_time: data.fajr_time || dateToTimeString(calculated.fajr),
        sunrise_time: data.sunrise_time || dateToTimeString(calculated.sunrise),
        dhuhr_time: data.dhuhr_time || dateToTimeString(calculated.dhuhr),
        asr_time: data.asr_time || dateToTimeString(calculated.asr),
        maghrib_time: data.maghrib_time || dateToTimeString(calculated.maghrib),
        isha_time: data.isha_time || dateToTimeString(calculated.isha),
        midnight: data.midnight || dateToTimeString(calculated.midnight),
        tahajjud: data.tahajjud || dateToTimeString(calculated.tahajjud),
      };

      setPrayerTimes(mergedTimes);
    } else {
      const calculated = calculatePrayerTimes(MOSQUE_LOCATION, new Date());

      const defaultTimes: PrayerTimesData = {
        fajr_time: dateToTimeString(calculated.fajr),
        sunrise_time: dateToTimeString(calculated.sunrise),
        dhuhr_time: dateToTimeString(calculated.dhuhr),
        asr_time: dateToTimeString(calculated.asr),
        maghrib_time: dateToTimeString(calculated.maghrib),
        isha_time: dateToTimeString(calculated.isha),
        midnight: dateToTimeString(calculated.midnight),
        tahajjud: dateToTimeString(calculated.tahajjud),
      };

      setPrayerTimes(defaultTimes);
    }
    setLoading(false);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';

    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const timeStringToDate = (timeString: string | null): Date | null => {
    if (!timeString) return null;
    try {
      const [hours, minutes] = timeString.split(':');
      const prayerHour = parseInt(hours);
      const currentHour = currentTime.getHours();

      const date = new Date();
      date.setHours(prayerHour, parseInt(minutes), 0, 0);

      // If prayer time is in early morning (12 AM - 5:59 AM) and current time is after 6 AM,
      // treat it as tomorrow (e.g., Midnight at 12:07 AM when it's 8 PM)
      if (prayerHour >= 0 && prayerHour < 6 && currentHour >= 6) {
        date.setDate(date.getDate() + 1);
      }

      return date;
    } catch {
      return null;
    }
  };

  const getNextPrayer = () => {
    if (!prayerTimes) return null;

    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr_time },
      { name: 'Sunrise', time: prayerTimes.sunrise_time },
      { name: 'Dhuhr', time: prayerTimes.dhuhr_time },
      { name: 'Asr', time: prayerTimes.asr_time },
      { name: 'Maghrib', time: prayerTimes.maghrib_time },
      { name: 'Isha', time: prayerTimes.isha_time },
      { name: 'Midnight', time: prayerTimes.midnight },
      { name: 'Tahajjud', time: prayerTimes.tahajjud },
    ];

    // Convert prayers to objects with Date timestamps
    const prayersWithDates = prayers
      .map(prayer => ({
        name: prayer.name,
        time: prayer.time,
        date: timeStringToDate(prayer.time)
      }))
      .filter(prayer => prayer.date && prayer.date > currentTime);

    // Sort by chronological order (earliest first)
    prayersWithDates.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return a.date.getTime() - b.date.getTime();
    });

    // Return the earliest upcoming prayer
    return prayersWithDates.length > 0 ? prayersWithDates[0].name : null;
  };

  const isPrayerCompleted = (timeString: string | null): boolean => {
    const prayerDate = timeStringToDate(timeString);
    if (!prayerDate) return false;
    return prayerDate < currentTime;
  };

  const getCountdown = (timeString: string | null): string => {
    const prayerDate = timeStringToDate(timeString);
    if (!prayerDate) return '';

    const diff = prayerDate.getTime() - currentTime.getTime();
    if (diff <= 0) return '';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handlePrayerClick = (prayerName: string) => {
    const info = prayerInformation[prayerName];
    if (info) {
      setSelectedPrayer(info);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrayer(null);
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <p className="text-xl">Loading prayer times...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!prayerTimes) {
    return null;
  }

  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr_time, icon: Moon, emoji: '🌌', color: 'from-indigo-600 to-purple-700' },
    { name: 'Sunrise', time: prayerTimes.sunrise_time, icon: Sunrise, emoji: '🌅', color: 'from-orange-500 to-pink-600' },
    { name: 'Dhuhr', time: prayerTimes.dhuhr_time, icon: Sun, emoji: '☀️', color: 'from-yellow-500 to-orange-500' },
    { name: 'Asr', time: prayerTimes.asr_time, icon: Sun, emoji: '🌇', color: 'from-amber-500 to-yellow-600' },
    { name: 'Tahajjud', time: prayerTimes.tahajjud, icon: Moon, emoji: '⭐', color: 'from-blue-700 to-slate-800' },
    { name: 'Midnight', time: prayerTimes.midnight, icon: Moon, emoji: '🌃', color: 'from-slate-600 to-slate-800' },
    { name: 'Isha', time: prayerTimes.isha_time, icon: Moon, emoji: '🌙', color: 'from-slate-700 to-indigo-800' },
    { name: 'Maghrib', time: prayerTimes.maghrib_time, icon: Sunset, emoji: '🌆', color: 'from-red-500 to-orange-600' },
  ];

  const nextPrayer = getNextPrayer();
  const hijriDate = getIslamicDate(new Date());
  const formattedHijriDate = formatIslamicDate(hijriDate);

  return (
    <div className="w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 py-8 md:py-12 shadow-2xl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
            Today's Prayer Times
          </h2>
          <p className="text-yellow-400 text-base md:text-lg mb-1">
            {formattedHijriDate}
          </p>
          <p className="text-slate-300 text-lg md:text-xl">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {prayers.map((prayer) => {
            const isNext = prayer.name === nextPrayer;
            const isCompleted = isPrayerCompleted(prayer.time);
            const countdown = isNext ? getCountdown(prayer.time) : '';

            const hasInfo = !!prayerInformation[prayer.name];

            return (
              <div
                key={prayer.name}
                onClick={() => hasInfo && handlePrayerClick(prayer.name)}
                className={`group relative bg-gradient-to-br rounded-xl p-6 transition-all duration-300 ${
                  isNext
                    ? 'from-emerald-700 to-teal-800 shadow-2xl shadow-emerald-500/50 border-2 border-yellow-400 animate-pulse scale-105'
                    : isCompleted
                    ? 'from-slate-700/50 to-slate-800/50 shadow-lg border border-slate-600 opacity-70'
                    : 'from-slate-700 to-slate-800 shadow-lg hover:shadow-2xl hover:scale-105 border border-yellow-500/80'
                } ${hasInfo ? 'cursor-pointer' : ''}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${prayer.color} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`}></div>

                <div className="relative z-10 text-center">
                  <div className="text-4xl md:text-5xl mb-3">
                    {prayer.emoji}
                  </div>
                  <h3 className={`text-lg md:text-xl font-bold mb-2 transition-colors break-words ${
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

                  {isCompleted && (
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
    </div>
  );
}
