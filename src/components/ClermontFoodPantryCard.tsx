import { Calendar } from 'lucide-react';

function getFirstSaturdayOfMonth(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();

  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  const firstSaturday = new Date(year, month, 1 + daysUntilSaturday);

  if (firstSaturday < now) {
    const nextMonth = new Date(year, month + 1, 1);
    const nextDayOfWeek = nextMonth.getDay();
    const nextDaysUntilSaturday = (6 - nextDayOfWeek + 7) % 7;
    return new Date(year, month + 1, 1 + nextDaysUntilSaturday);
  }

  return firstSaturday;
}

export default function ClermontFoodPantryCard() {
  const nextDistributionDate = getFirstSaturdayOfMonth();

  const formattedDate = nextDistributionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-br from-teal-900/40 to-teal-800/30 rounded-lg border border-teal-700/50 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-teal-300" />
        <h3 className="text-base md:text-lg font-bold text-teal-100">
          Clermont Food Pantry
        </h3>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs md:text-sm text-teal-200 font-semibold mb-1">Next Distribution Date:</p>
          <p className="text-sm md:text-base text-white font-semibold">{formattedDate}</p>
        </div>

        <a
          href="https://www.clermontfoodpantry.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs md:text-sm text-teal-300 hover:text-teal-100 underline transition-colors"
        >
          www.clermontfoodpantry.org
        </a>
      </div>
    </div>
  );
}
