import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, Prayer, Qibla } from 'adhan';
import * as SunCalc from 'suncalc';

export interface PrayerTimes {
  astronomicalDawn: Date;
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  midnight: Date;
  tahajjud: Date;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  timezone?: string;
}

export function calculatePrayerTimes(location: LocationInfo, date: Date = new Date()): PrayerTimes {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const coordinates = new Coordinates(location.latitude, location.longitude);
  const params = CalculationMethod.NorthAmerica();

  const prayerTimes = new AdhanPrayerTimes(coordinates, normalizedDate, params);

  const sunTimes = SunCalc.getTimes(normalizedDate, location.latitude, location.longitude);
  const astronomicalDawn = sunTimes.nightEnd;

  const nextDay = new Date(normalizedDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayPrayers = new AdhanPrayerTimes(coordinates, nextDay, params);

  const midnight = new Date(
    (prayerTimes.maghrib.getTime() + nextDayPrayers.fajr.getTime()) / 2
  );

  const tahajjud = new Date(
    prayerTimes.maghrib.getTime() +
    (nextDayPrayers.fajr.getTime() - prayerTimes.maghrib.getTime()) * (2/3)
  );

  return {
    astronomicalDawn: astronomicalDawn,
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    midnight,
    tahajjud
  };
}

export function calculateQiblaDirection(location: LocationInfo): number {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  return Qibla(coordinates);
}

export function calculateDistanceToKaaba(location: LocationInfo): number {
  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;

  const R = 6371;
  const dLat = (kaabaLat - location.latitude) * Math.PI / 180;
  const dLon = (kaabaLon - location.longitude) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(location.latitude * Math.PI / 180) * Math.cos(kaabaLat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

export function getNextPrayer(prayerTimes: PrayerTimes, now: Date = new Date(), location?: LocationInfo): { name: string; time: Date; timeUntil: number } | null {
  const prayers = [
    { name: 'Astronomical Dawn', time: prayerTimes.astronomicalDawn },
    { name: 'Fajr', time: prayerTimes.fajr },
    { name: 'Sunrise', time: prayerTimes.sunrise },
    { name: 'Dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', time: prayerTimes.asr },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', time: prayerTimes.isha },
    { name: 'Midnight', time: prayerTimes.midnight },
    { name: 'Tahajjud', time: prayerTimes.tahajjud },
  ];

  for (const prayer of prayers) {
    if (prayer.time > now) {
      return {
        name: prayer.name,
        time: prayer.time,
        timeUntil: prayer.time.getTime() - now.getTime()
      };
    }
  }

  if (location) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowPrayers = calculatePrayerTimes(location, tomorrow);

    return {
      name: 'Astronomical Dawn',
      time: tomorrowPrayers.astronomicalDawn,
      timeUntil: tomorrowPrayers.astronomicalDawn.getTime() - now.getTime()
    };
  }

  return null;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function formatCountdown(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
