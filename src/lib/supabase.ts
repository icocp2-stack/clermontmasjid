import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserLocation {
  id?: string;
  user_id: string;
  latitude: number;
  longitude: number;
  city: string;
  state_province: string;
  country: string;
  postal_code: string;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}
