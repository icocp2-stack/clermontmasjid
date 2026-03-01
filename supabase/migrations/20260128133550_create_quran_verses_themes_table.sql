/*
  # Create Quran Verses with Themes Table

  1. New Tables
    - `quran_verses_themes`
      - `id` (uuid, primary key) - Unique identifier
      - `count` (integer) - Order/count number
      - `quran_theme` (text) - Main Quran theme category
      - `verse_theme` (text) - Specific verse theme
      - `chapter` (integer) - Surah/Chapter number (1-114)
      - `verse` (integer) - Ayah/Verse number
      - `verse_text_arabic` (text) - Arabic text of the verse
      - `verse_text_translation` (text) - English translation
      - `user_id` (uuid, foreign key) - References auth.users
      - `created_at` (timestamptz) - When record was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `quran_verses_themes` table
    - Add policy for authenticated users to read all verses
    - Add policy for authenticated users to insert their own verses
    - Add policy for authenticated users to update their own verses
    - Add policy for authenticated users to delete their own verses

  3. Indexes
    - Index on `chapter` and `verse` for fast lookups
    - Index on `quran_theme` for theme-based queries
    - Index on `user_id` for user-specific queries
*/

CREATE TABLE IF NOT EXISTS quran_verses_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  count integer,
  quran_theme text NOT NULL,
  verse_theme text NOT NULL,
  chapter integer NOT NULL CHECK (chapter >= 1 AND chapter <= 114),
  verse integer NOT NULL CHECK (verse >= 1),
  verse_text_arabic text DEFAULT '',
  verse_text_translation text DEFAULT '',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quran_verses_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read Quran verses"
  ON quran_verses_themes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert verses"
  ON quran_verses_themes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verses"
  ON quran_verses_themes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own verses"
  ON quran_verses_themes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quran_verses_chapter_verse ON quran_verses_themes(chapter, verse);
CREATE INDEX IF NOT EXISTS idx_quran_verses_theme ON quran_verses_themes(quran_theme);
CREATE INDEX IF NOT EXISTS idx_quran_verses_user ON quran_verses_themes(user_id);
