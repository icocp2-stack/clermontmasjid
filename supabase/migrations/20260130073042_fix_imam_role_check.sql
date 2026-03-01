/*
  # Fix Imam Role Check

  ## Problem
  Similar to the admin role check, users cannot check if they are an imam
  because the RLS policy requires them to already be an admin.

  ## Solution
  Add a policy that allows any authenticated user to check if THEIR OWN
  email is in the imam_users table.

  ## Changes
  1. Add policy for authenticated users to check their own imam status
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can view all imam users" ON imam_users;

-- Allow authenticated users to check if their own email is in imam_users
CREATE POLICY "Users can check own imam status"
  ON imam_users FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow admins to view all imam users
CREATE POLICY "Admins can view all imam users"
  ON imam_users FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );
