/*
  # Fix Admin and Imam Role Check

  ## Problem
  Users cannot check their own role because RLS policies require them to already be an admin to view admin_users table. This creates a circular dependency.

  ## Solution
  Add policies that allow any authenticated user to check if their OWN email exists in the admin_users or imam_users tables.

  ## Changes
  1. Add policy for authenticated users to check if their email is in admin_users
  2. Add policy for authenticated users to check if their email is in imam_users
*/

-- Allow authenticated users to check if their own email is in admin_users
CREATE POLICY "Users can check if they are admin"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow authenticated users to check if their own email is in imam_users
CREATE POLICY "Users can check if they are imam"
  ON imam_users FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
