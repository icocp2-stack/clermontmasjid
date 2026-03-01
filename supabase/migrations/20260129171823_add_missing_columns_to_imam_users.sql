/*
  # Add Missing Columns to imam_users Table

  This migration adds the missing columns to the imam_users table:
  - email column (the primary data field)
  - display_name column (optional public name)
  - created_by column (tracks who added the imam)

  If the columns already exist, this migration will safely skip them.
*/

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imam_users' AND column_name = 'email'
  ) THEN
    ALTER TABLE imam_users ADD COLUMN email text UNIQUE NOT NULL;
  END IF;
END $$;

-- Add display_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imam_users' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE imam_users ADD COLUMN display_name text;
  END IF;
END $$;

-- Add created_by column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imam_users' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE imam_users ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create index on email if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_imam_users_email ON imam_users(email);