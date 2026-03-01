/*
  # Secure Mosque Prayer Times Access

  1. Security Changes
    - Remove overly permissive public policies
    - Add restrictive policies:
      - Public can view prayer times
      - Only admins can insert/update/delete prayer times
    
  2. Important Notes
    - Uses the is_admin flag from app_users table
    - Ensures data integrity by limiting write access to admins only
*/

DROP POLICY IF EXISTS "Public can manage prayer times" ON mosque_prayer_times;
DROP POLICY IF EXISTS "Anyone can view mosque prayer times" ON mosque_prayer_times;

CREATE POLICY "Anyone can view prayer times"
  ON mosque_prayer_times
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert prayer times"
  ON mosque_prayer_times
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.user_id = auth.uid()
      AND app_users.is_admin = true
    )
  );

CREATE POLICY "Admins can update prayer times"
  ON mosque_prayer_times
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.user_id = auth.uid()
      AND app_users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.user_id = auth.uid()
      AND app_users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete prayer times"
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
