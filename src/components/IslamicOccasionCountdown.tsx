import { useMemo } from 'react';
import { getNextIslamicOccasion } from '../services/islamicOccasions';
import { Calendar } from 'lucide-react';

interface IslamicOccasionCountdownProps {
  currentDate: Date;
}

export default function IslamicOccasionCountdown({ currentDate }: IslamicOccasionCountdownProps) {
  const nextOccasion = useMemo(() => {
    return getNextIslamicOccasion(currentDate);
  }, [currentDate]);

  if (!nextOccasion) {
    return null;
  }

  const { occasion, daysRemaining, hijriYear } = nextOccasion;

  const formatDaysRemaining = (days: number) => {
    if (days === 0) return 'Today!';
    if (days === 1) return '1 Day';
    return `${days} Days`;
  };

  return (
    <div className="mt-4 p-3 md:p-4 bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-lg border border-amber-700/50">
      <div className="mb-3 space-y-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
          <h4 className="text-amber-200 font-semibold text-xs md:text-sm">Upcoming Occasion</h4>
        </div>
        <div className="text-slate-400 text-xs pl-6 md:pl-7">
          {occasion.hijriDay} {getHijriMonthName(occasion.hijriMonth)} {hijriYear} AH
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="text-white font-bold text-base md:text-lg">
            {occasion.name}
          </div>
          <div className="text-amber-400 font-bold text-base md:text-lg">
            {formatDaysRemaining(daysRemaining)}
          </div>
        </div>

        <div className="text-amber-300 text-xs md:text-sm">
          {occasion.description}
        </div>
      </div>
    </div>
  );
}

function getHijriMonthName(month: number): string {
  const months = [
    '', 'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaʿbān',
    'Ramaḍān', 'Shawwāl', 'Dhul-Qiʿdah', 'Dhul-Hijjah'
  ];
  return months[month] || '';
}
