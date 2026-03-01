export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state_province: string;
  country: string;
  postal_code: string;
  timezone: string;
}

export async function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    const address = data.address || {};

    const city = address.city || address.town || address.village || address.suburb || '';
    const state = address.state || address.province || address.region || '';
    const country = address.country || '';
    const postalCode = address.postcode || '';

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
      latitude,
      longitude,
      city,
      state_province: state,
      country,
      postal_code: postalCode,
      timezone
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      latitude,
      longitude,
      city: '',
      state_province: '',
      country: '',
      postal_code: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}

export async function searchLocation(query: string): Promise<LocationData[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
      {
        headers: {
          'Accept-Language': 'en'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Location search failed');
    }

    const data = await response.json();

    return data.map((item: any) => {
      const address = item.address || {};
      return {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        city: address.city || address.town || address.village || address.suburb || '',
        state_province: address.state || address.province || address.region || '',
        country: address.country || '',
        postal_code: address.postcode || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    });
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
}

export function generateUserId(): string {
  let userId = localStorage.getItem('prayer_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('prayer_user_id', userId);
  }
  return userId;
}
