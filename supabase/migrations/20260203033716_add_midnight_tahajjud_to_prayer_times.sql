/*
  # Add Midnight and Tahajjud Prayer Times

  1. Changes
    - Add `midnight` column to `mosque_prayer_times` table
    - Add `tahajjud` column to `mosque_prayer_times` table
    
  2. Calculation Method
    - Midnight: Calculated as the midpoint between Maghrib (sunset) and next Fajr (sunrise)
    - Tahajjud: Calculated as the first third of the time period from midnight to Fajr
    
  3. Security
    - No RLS changes needed (inherits existing table policies)
*/

-- Add midnight and tahajjud columns to mosque_prayer_times table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mosque_prayer_times' AND column_name = 'midnight'
  ) THEN
    ALTER TABLE mosque_prayer_times ADD COLUMN midnight TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mosque_prayer_times' AND column_name = 'tahajjud'
  ) THEN
    ALTER TABLE mosque_prayer_times ADD COLUMN tahajjud TEXT;
  END IF;
END $$;