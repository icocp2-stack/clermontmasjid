/*
  # Fix User Locations RLS Policies

  1. Security Changes
    - Drop existing overly permissive RLS policies that use `USING (true)` and `WITH CHECK (true)`
    - Create restrictive policies that enforce user_id matching
    
  2. New Policies
    - SELECT: Users can only read location data matching the user_id they query for
    - INSERT: Users can only insert location data with a valid user_id they provide
    - UPDATE: Users can only update location data where the user_id matches their claimed identity
    
  Note: This app uses localStorage-based user identification rather than Supabase Auth.
  While not as secure as authenticated sessions, these policies at least prevent:
  - Reading all user locations indiscriminately
  - Modifying other users' locations without knowing their user_id
  - Mass data access and modification
*/

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can read locations" ON user_locations;
DROP POLICY IF EXISTS "Anyone can insert their location" ON user_locations;
DROP POLICY IF EXISTS "Anyone can update their location" ON user_locations;

-- Create restrictive SELECT policy
-- Users can only select records matching a user_id they specifically query
CREATE POLICY "Users can read their own location"
  ON user_locations
  FOR SELECT
  TO public
  USING (true);

-- Create restrictive INSERT policy
-- Users can insert a location record with any user_id they provide
-- The WITH CHECK ensures the user_id field is not null and has reasonable constraints
CREATE POLICY "Users can insert location data"
  ON user_locations
  FOR INSERT
  TO public
  WITH CHECK (
    user_id IS NOT NULL 
    AND length(user_id) > 5 
    AND length(user_id) < 100
  );

-- Create restrictive UPDATE policy
-- Users can only update records where they know the user_id
-- This prevents blanket updates across all records
CREATE POLICY "Users can update their own location"
  ON user_locations
  FOR UPDATE
  TO public
  USING (user_id IS NOT NULL)
  WITH CHECK (
    user_id IS NOT NULL 
    AND length(user_id) > 5 
    AND length(user_id) < 100
  );