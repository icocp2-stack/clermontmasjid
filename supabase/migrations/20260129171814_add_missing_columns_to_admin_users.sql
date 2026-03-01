/*
  # Add Missing Columns to admin_users Table

  This migration adds the missing columns to the admin_users table:
  - email column (the primary data field)
  - created_by column (tracks who added the admin)

  If the columns already exist, this migration will safely skip them.
*/

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'email'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN email text UNIQUE NOT NULL;
  END IF;
END $$;

-- Add created_by column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create index on email if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);