import { supabase, UserLocation } from '../lib/supabase';
import { generateUserId } from './geolocation';
import type { LocationData } from './geolocation';

export async function saveUserLocation(location: LocationData): Promise<void> {
  const userId = generateUserId();

  const { data: existingLocation } = await supabase
    .from('user_locations')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  const locationData: Partial<UserLocation> = {
    user_id: userId,
    latitude: location.latitude,
    longitude: location.longitude,
    city: location.city,
    state_province: location.state_province,
    country: location.country,
    postal_code: location.postal_code,
    timezone: location.timezone,
    updated_at: new Date().toISOString()
  };

  if (existingLocation) {
    await supabase
      .from('user_locations')
      .update(locationData)
      .eq('id', existingLocation.id);
  } else {
    await supabase
      .from('user_locations')
      .insert(locationData);
  }
}

export async function loadUserLocation(): Promise<LocationData | null> {
  const userId = generateUserId();

  const { data, error } = await supabase
    .from('user_locations')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    city: data.city,
    state_province: data.state_province,
    country: data.country,
    postal_code: data.postal_code,
    timezone: data.timezone
  };
}
