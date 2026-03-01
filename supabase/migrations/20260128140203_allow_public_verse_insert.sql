/*
  # Allow Public Verse Inserts
  
  1. Changes
    - Drop the existing restrictive INSERT policy
    - Create a new policy that allows anyone to insert verses
    - This enables verse imports without authentication
  
  2. Security Notes
    - Reading verses remains public (anyone can read)
    - Inserting verses is now public (for importing data)
    - Updating/deleting still requires authentication and ownership
*/

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Authenticated users can insert verses" ON quran_verses_themes;

-- Create a new public insert policy
CREATE POLICY "Anyone can insert verses"
  ON quran_verses_themes
  FOR INSERT
  WITH CHECK (true);