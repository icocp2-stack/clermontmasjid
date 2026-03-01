/*
  # Secure Imam Signup Policy

  ## Overview
  This migration fixes the security issue where the imam signup policy
  allowed unrestricted access (WITH CHECK = true). Now users can only
  create imam_users records for their own authenticated email address.

  ## Changes
  - Replace overly permissive "Allow public imam signup" policy
  - New policy ensures users can only register themselves as imams
  - Validates that the email in imam_users matches the authenticated user's email

  ## Security Improvement
  - Users cannot create imam accounts for other email addresses
  - Each user can only register their own account as an imam
  - Maintains self-service registration while preventing abuse
*/

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow public imam signup" ON imam_users;

-- Create a secure policy that only allows users to register their own email
CREATE POLICY "Users can register as imams with own email"
  ON imam_users FOR INSERT
  TO authenticated
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = (select auth.uid()))
  );
