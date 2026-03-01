/*
  # Add user_id Column to imam_users Table

  ## Overview
  This migration adds a user_id column to link imam_users records
  with their corresponding auth.users accounts.

  ## Changes
  - Add user_id column referencing auth.users(id)
  - Add unique constraint to ensure one imam_user per auth user
  - Create index for performance

  ## Benefits
  - Proper relationship between imam_users and auth.users
  - Enables efficient lookups
  - Prevents duplicate imam records for same user
*/

-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imam_users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE imam_users ADD COLUMN user_id uuid REFERENCES auth.users(id) UNIQUE;
  END IF;
END $$;

-- Create index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_imam_users_user_id ON imam_users(user_id);
