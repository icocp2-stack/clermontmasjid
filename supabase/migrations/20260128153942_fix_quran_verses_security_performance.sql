/*
  # Fix Security and Performance Issues for Quran Verses Table

  1. Performance Improvements
    - Update RLS policies to use (select auth.uid()) instead of auth.uid()
    - This prevents re-evaluation for each row and significantly improves query performance
  
  2. Security Improvements
    - Replace the overly permissive "Anyone can insert verses" policy
    - Require authentication for insert operations
    - Ensure proper user_id assignment on insert
  
  3. Database Optimization
    - Drop unused indexes that are not being utilized
    - Reduces storage overhead and improves write performance
  
  4. Changes Made
    - Fixed "Users can update own verses" policy with optimized auth check
    - Fixed "Users can delete own verses" policy with optimized auth check
    - Replaced "Anyone can insert verses" with authenticated-only policy
    - Dropped unused indexes: idx_quran_verses_chapter_verse, idx_quran_verses_theme, idx_quran_verses_user
*/

-- Drop existing policies that need to be fixed
DROP POLICY IF EXISTS "Users can update own verses" ON quran_verses_themes;
DROP POLICY IF EXISTS "Users can delete own verses" ON quran_verses_themes;
DROP POLICY IF EXISTS "Anyone can insert verses" ON quran_verses_themes;

-- Create optimized UPDATE policy using (select auth.uid())
CREATE POLICY "Users can update own verses"
  ON quran_verses_themes
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Create optimized DELETE policy using (select auth.uid())
CREATE POLICY "Users can delete own verses"
  ON quran_verses_themes
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Create secure INSERT policy requiring authentication
CREATE POLICY "Authenticated users can insert verses"
  ON quran_verses_themes
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop unused indexes to improve write performance and reduce storage
DROP INDEX IF EXISTS idx_quran_verses_chapter_verse;
DROP INDEX IF EXISTS idx_quran_verses_theme;
DROP INDEX IF EXISTS idx_quran_verses_user;