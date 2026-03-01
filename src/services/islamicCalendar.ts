import { toHijri } from 'hijri-converter';

export interface IslamicDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  dayName: string;
}

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhul-Qadah',
  'Dhul-Hijjah'
];

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export function getIslamicDate(date: Date = new Date()): IslamicDate {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const hijri = toHijri(year, month, day);

  return {
    day: hijri.hd,
    month: hijri.hm,
    year: hijri.hy,
    monthName: HIJRI_MONTHS[hijri.hm - 1],
    dayName: DAYS_OF_WEEK[date.getDay()]
  };
}

export function formatIslamicDate(islamicDate: IslamicDate): string {
  return `${islamicDate.day} ${islamicDate.monthName} ${islamicDate.year} AH`;
}
