/*
  # Allow Public Imam Account Creation

  ## Overview
  This migration allows anyone to create an imam account by adding a policy
  that permits public inserts into the imam_users table.

  ## Changes
  - Add public INSERT policy for imam_users table
  - This allows the ImamSetup component to work for self-registration

  ## Security Note
  This enables self-service imam account creation. Consider:
  - Adding admin approval workflow
  - Or removing this policy and only allowing admin-created imam accounts
*/

-- Allow anyone to insert into imam_users during signup
CREATE POLICY "Allow public imam signup"
  ON imam_users FOR INSERT
  TO public
  WITH CHECK (true);
