import * as SunCalc from 'suncalc';
import { Vector3 } from 'three';

export interface SunPosition {
  azimuth: number;
  altitude: number;
  position: Vector3;
}

export interface MoonPosition {
  azimuth: number;
  altitude: number;
  position: Vector3;
  phase: number;
  illumination: number;
}

export interface SunMoonTimes {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  moonrise: Date | null;
  moonset: Date | null;
}

const EARTH_RADIUS = 6371;
const SUN_DISTANCE = 149600;
const MOON_DISTANCE = 384.4;

export function getSunPosition(date: Date, latitude: number, longitude: number): SunPosition {
  const pos = SunCalc.getPosition(date, latitude, longitude);

  const distance = SUN_DISTANCE;
  const x = distance * Math.cos(pos.altitude) * Math.sin(pos.azimuth);
  const y = distance * Math.sin(pos.altitude);
  const z = distance * Math.cos(pos.altitude) * Math.cos(pos.azimuth);

  return {
    azimuth: pos.azimuth,
    altitude: pos.altitude,
    position: new Vector3(x, y, z)
  };
}

export function getMoonPosition(date: Date, latitude: number, longitude: number): MoonPosition {
  const pos = SunCalc.getMoonPosition(date, latitude, longitude);
  const illumination = SunCalc.getMoonIllumination(date);

  const distance = MOON_DISTANCE;
  const x = distance * Math.cos(pos.altitude) * Math.sin(pos.azimuth);
  const y = distance * Math.sin(pos.altitude);
  const z = distance * Math.cos(pos.altitude) * Math.cos(pos.azimuth);

  return {
    azimuth: pos.azimuth,
    altitude: pos.altitude,
    position: new Vector3(x, y, z),
    phase: illumination.phase,
    illumination: illumination.fraction
  };
}

export function getSunMoonTimes(date: Date, latitude: number, longitude: number): SunMoonTimes {
  const sunTimes = SunCalc.getTimes(date, latitude, longitude);
  const moonTimes = SunCalc.getMoonTimes(date, latitude, longitude);

  return {
    sunrise: sunTimes.sunrise,
    sunset: sunTimes.sunset,
    solarNoon: sunTimes.solarNoon,
    moonrise: moonTimes.rise || null,
    moonset: moonTimes.set || null
  };
}

export function getMoonPhaseName(phase: number): string {
  if (phase < 0.0625) return 'New Moon';
  if (phase < 0.1875) return 'Waxing Crescent';
  if (phase < 0.3125) return 'First Quarter';
  if (phase < 0.4375) return 'Waxing Gibbous';
  if (phase < 0.5625) return 'Full Moon';
  if (phase < 0.6875) return 'Waning Gibbous';
  if (phase < 0.8125) return 'Last Quarter';
  if (phase < 0.9375) return 'Waning Crescent';
  return 'New Moon';
}

export function calculateSunPositionForLongitude(date: Date, longitude: number): SunPosition {
  return getSunPosition(date, 0, longitude);
}

export function getSunSubsolarPoint(date: Date): { latitude: number; longitude: number } {
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const millisecondsSinceJ2000 = date.getTime() - J2000;
  const daysSinceJ2000 = millisecondsSinceJ2000 / (1000 * 60 * 60 * 24);

  const meanLongitude = (280.460 + 0.9856474 * daysSinceJ2000) % 360;
  const meanAnomaly = (357.528 + 0.9856003 * daysSinceJ2000) % 360;
  const eclipticLongitude = meanLongitude + 1.915 * Math.sin(meanAnomaly * Math.PI / 180) + 0.020 * Math.sin(2 * meanAnomaly * Math.PI / 180);

  const obliquity = 23.439 - 0.0000004 * daysSinceJ2000;
  const declination = Math.asin(Math.sin(obliquity * Math.PI / 180) * Math.sin(eclipticLongitude * Math.PI / 180)) * 180 / Math.PI;

  const greenwichMeanSiderealTime = (280.460 + 360.9856474 * daysSinceJ2000) % 360;
  const longitude = (eclipticLongitude - greenwichMeanSiderealTime + 360) % 360;
  const adjustedLongitude = longitude > 180 ? longitude - 360 : longitude;

  return {
    latitude: declination,
    longitude: adjustedLongitude
  };
}

export function getMoonSublunarPoint(date: Date): { latitude: number; longitude: number } {
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const millisecondsSinceJ2000 = date.getTime() - J2000;
  const daysSinceJ2000 = millisecondsSinceJ2000 / (1000 * 60 * 60 * 24);
  const T = daysSinceJ2000 / 36525;

  const L0 = (218.316 + 13.176396 * daysSinceJ2000) % 360;
  const l = (134.963 + 13.064993 * daysSinceJ2000) % 360;
  const lp = (357.529 + 0.985600 * daysSinceJ2000) % 360;
  const F = (93.272 + 13.229350 * daysSinceJ2000) % 360;
  const D = (297.850 + 12.190749 * daysSinceJ2000) % 360;

  const eclipticLongitude = L0 +
    6.289 * Math.sin(l * Math.PI / 180) +
    1.274 * Math.sin((2 * D - l) * Math.PI / 180) +
    0.658 * Math.sin(2 * D * Math.PI / 180) +
    0.214 * Math.sin(2 * l * Math.PI / 180) -
    0.186 * Math.sin(lp * Math.PI / 180);

  const eclipticLatitude =
    5.128 * Math.sin(F * Math.PI / 180) +
    0.280 * Math.sin((l + F) * Math.PI / 180) +
    0.280 * Math.sin((l - F) * Math.PI / 180) +
    0.174 * Math.sin(((2 * D) - F) * Math.PI / 180);

  const obliquity = 23.439 - 0.0000004 * daysSinceJ2000;

  const sinDec = Math.sin(eclipticLatitude * Math.PI / 180) * Math.cos(obliquity * Math.PI / 180) +
                 Math.cos(eclipticLatitude * Math.PI / 180) * Math.sin(obliquity * Math.PI / 180) *
                 Math.sin(eclipticLongitude * Math.PI / 180);
  const declination = Math.asin(sinDec) * 180 / Math.PI;

  const y = Math.sin(eclipticLongitude * Math.PI / 180) * Math.cos(obliquity * Math.PI / 180) -
            Math.tan(eclipticLatitude * Math.PI / 180) * Math.sin(obliquity * Math.PI / 180);
  const x = Math.cos(eclipticLongitude * Math.PI / 180);
  let rightAscension = Math.atan2(y, x) * 180 / Math.PI;
  if (rightAscension < 0) rightAscension += 360;

  const greenwichMeanSiderealTime = (280.460 + 360.9856474 * daysSinceJ2000) % 360;
  let longitude = (rightAscension - greenwichMeanSiderealTime + 360) % 360;
  if (longitude > 180) longitude -= 360;

  return {
    latitude: declination,
    longitude: longitude
  };
}
