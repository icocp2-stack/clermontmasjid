/*
  # Fix Admin Role Check

  ## Problem
  Users cannot check if they are an admin because the RLS policy requires
  them to already be an admin to query the admin_users table.

  ## Solution
  Add a policy that allows any authenticated user to check if THEIR OWN
  email is in the admin_users table.

  ## Changes
  1. Add policy for authenticated users to check their own admin status
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;

-- Allow authenticated users to check if their own email is in admin_users
CREATE POLICY "Users can check own admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow admins to view all admin users
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );
