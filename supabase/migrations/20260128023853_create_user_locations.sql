/*
  # User Location Preferences

  1. New Tables
    - `user_locations`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid) - User identifier from browser fingerprint/session
      - `latitude` (numeric) - Location latitude
      - `longitude` (numeric) - Location longitude
      - `city` (text) - City name
      - `state_province` (text) - State or Province
      - `country` (text) - Country name
      - `postal_code` (text) - Zip or Postal code
      - `timezone` (text) - IANA timezone identifier
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `user_locations` table
    - Public access for location storage (since we're using browser-based identification)
*/

CREATE TABLE IF NOT EXISTS user_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  city text DEFAULT '',
  state_province text DEFAULT '',
  country text DEFAULT '',
  postal_code text DEFAULT '',
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read locations"
  ON user_locations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert their location"
  ON user_locations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update their location"
  ON user_locations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
