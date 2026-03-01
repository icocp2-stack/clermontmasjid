/*
  # Allow Imams to Read Their Own Profile

  ## Overview
  This migration allows authenticated users to read their own imam_users record.
  This is necessary for the auth system to verify if a user is an imam.

  ## Changes
  - Add SELECT policy for imam_users allowing users to read their own profile

  ## Security
  - Users can only read their own record (WHERE user_id = auth.uid())
  - Admins can still read all records via existing policy
*/

-- Allow authenticated users to read their own imam profile
CREATE POLICY "Imams can read own profile"
  ON imam_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
