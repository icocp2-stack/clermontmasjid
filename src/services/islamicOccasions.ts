import { toGregorian, HijriDate } from 'hijri-converter';

export interface IslamicOccasion {
  name: string;
  hijriMonth: number;
  hijriDay: number;
  description: string;
}

export const ISLAMIC_OCCASIONS: IslamicOccasion[] = [
  { name: 'Beginning of Shaʿbān', hijriMonth: 8, hijriDay: 1, description: 'Start of the 8th month' },
  { name: 'Laylat al-Barāʾah', hijriMonth: 8, hijriDay: 15, description: 'Night of Forgiveness' },
  { name: 'Beginning of Ramaḍān', hijriMonth: 9, hijriDay: 1, description: 'Start of fasting month' },
  { name: 'Laylat al-Qadr', hijriMonth: 9, hijriDay: 27, description: 'Night of Decree' },
  { name: 'Eid al-Fiṭr', hijriMonth: 10, hijriDay: 1, description: 'Festival of Breaking the Fast' },
  { name: 'Best Days Begin', hijriMonth: 12, hijriDay: 1, description: 'First 10 days of Dhul-Hijjah' },
  { name: 'Day of ʿArafah', hijriMonth: 12, hijriDay: 9, description: 'Day of Standing at Arafah' },
  { name: 'Eid al-Aḍḥā', hijriMonth: 12, hijriDay: 10, description: 'Festival of Sacrifice' },
  { name: 'Days of Tashrīq', hijriMonth: 12, hijriDay: 11, description: 'Days of remembrance' },
  { name: 'Islamic New Year', hijriMonth: 1, hijriDay: 1, description: 'Beginning of Hijri year' },
  { name: 'Day of ʿĀshūrāʾ', hijriMonth: 1, hijriDay: 10, description: 'Day of Ashura' },
  { name: 'Al-Isrāʾ wal-Miʿrāj', hijriMonth: 7, hijriDay: 27, description: 'Night Journey and Ascension' },
];

export function getNextIslamicOccasion(currentDate: Date): {
  occasion: IslamicOccasion;
  gregorianDate: Date;
  daysRemaining: number;
  hijriYear: number;
} | null {
  const currentHijri = toHijri(currentDate);
  const currentHijriYear = currentHijri.hy;

  let closestOccasion: {
    occasion: IslamicOccasion;
    gregorianDate: Date;
    daysRemaining: number;
    hijriYear: number;
  } | null = null;
  let minDaysRemaining = Infinity;

  for (const occasion of ISLAMIC_OCCASIONS) {
    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const hijriYear = currentHijriYear + yearOffset;

      try {
        const gregorianDate = toGregorian(hijriYear, occasion.hijriMonth, occasion.hijriDay);
        const occasionDate = new Date(gregorianDate.gy, gregorianDate.gm - 1, gregorianDate.gd);

        occasionDate.setHours(0, 0, 0, 0);
        const today = new Date(currentDate);
        today.setHours(0, 0, 0, 0);

        const timeDiff = occasionDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysRemaining >= 0 && daysRemaining < minDaysRemaining) {
          minDaysRemaining = daysRemaining;
          closestOccasion = {
            occasion,
            gregorianDate: occasionDate,
            daysRemaining,
            hijriYear
          };
        }
      } catch (error) {
        console.error(`Error converting date for ${occasion.name}:`, error);
      }
    }
  }

  return closestOccasion;
}

function toHijri(date: Date): HijriDate {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const estimatedHijriYear = Math.floor((year - 622) * 1.030684);

  for (let hy = estimatedHijriYear - 1; hy <= estimatedHijriYear + 2; hy++) {
    for (let hm = 1; hm <= 12; hm++) {
      for (let hd = 1; hd <= 30; hd++) {
        try {
          const greg = toGregorian(hy, hm, hd);
          if (greg.gy === year && greg.gm === month && greg.gd === day) {
            return { hy, hm, hd };
          }
        } catch (e) {
          continue;
        }
      }
    }
  }

  return { hy: estimatedHijriYear, hm: 1, hd: 1 };
}
