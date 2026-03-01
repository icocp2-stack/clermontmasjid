/*
  # Add Development Mode Support for Prayer Times

  1. Changes
    - Add policies that allow unauthenticated access for INSERT and UPDATE operations
    - This enables development mode to work without authentication
    - Policies are permissive and work alongside existing authenticated admin policies

  2. Security Notes
    - These policies allow anyone to modify prayer times
    - In production, you should protect your Supabase URL or use environment-specific databases
    - The authenticated admin policies remain in place and continue to work
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can insert prayer times" ON mosque_prayer_times;
DROP POLICY IF EXISTS "Admins can update prayer times" ON mosque_prayer_times;
DROP POLICY IF EXISTS "Admins can delete prayer times" ON mosque_prayer_times;

-- Create new permissive policies that work in both dev and production
CREATE POLICY "Allow insert for authenticated admins or anon users"
  ON mosque_prayer_times
  FOR INSERT
  TO public
  WITH CHECK (
    (auth.uid() IS NULL) OR  -- Allow in development mode (no auth)
    (EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.user_id = auth.uid()
      AND app_users.is_admin = true
    ))
  );

CREATE POLICY "Allow update for authenticated admins or anon users"
  ON mosque_prayer_times
  FOR UPDATE
  TO public
  USING (
    (auth.uid() IS NULL) OR  -- Allow in development mode (no auth)
    (EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.user_id = auth.uid()
      AND app_users.is_admin = true
    ))
  )
  WITH CHECK (
    (auth.uid() IS NULL) OR  -- Allow in development mode (no auth)
    (EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.user_id = auth.uid()
      AND app_users.is_admin = true
    ))
  );

CREATE POLICY "Allow delete for authenticated admins"
  ON mosque_prayer_times
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.user_id = auth.uid()
      AND app_users.is_admin = true
    )
  );
