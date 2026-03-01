/*
  # Fix Remaining Security Issues

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  - Add index for `imam_posts.author_id`
  - Add index for `quran_verses_themes.user_id`

  ### 2. Remove Unused Foreign Key Indexes
  - Remove unused indexes that were created but not utilized by queries:
    - idx_prayer_time_adjustments_created_by
    - idx_ramadan_tarawih_videos_added_by
    - idx_imam_youtube_videos_added_by
    - idx_netlify_config_updated_by

  ### 3. Fix mosque_prayer_times RLS Policy Optimization
  - Wrap `auth.role()` with `(select auth.role())` to prevent re-evaluation per row

  ## Security Notes
  - Foreign key indexes added only for actively used relationships
  - Unused indexes removed to improve write performance
  - RLS policies optimized for better query performance
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_imam_posts_author_id 
  ON imam_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_quran_verses_themes_user_id 
  ON quran_verses_themes(user_id);

-- =====================================================
-- 2. REMOVE UNUSED FOREIGN KEY INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_prayer_time_adjustments_created_by;
DROP INDEX IF EXISTS idx_ramadan_tarawih_videos_added_by;
DROP INDEX IF EXISTS idx_imam_youtube_videos_added_by;
DROP INDEX IF EXISTS idx_netlify_config_updated_by;

-- =====================================================
-- 3. FIX mosque_prayer_times RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow insert for authenticated admins or anon users" ON mosque_prayer_times;
DROP POLICY IF EXISTS "Allow update for authenticated admins or anon users" ON mosque_prayer_times;

-- Recreate with optimized auth function calls
CREATE POLICY "Allow insert for authenticated admins or anon users"
  ON mosque_prayer_times FOR INSERT
  WITH CHECK (
    (select auth.role()) = 'anon' OR
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );

CREATE POLICY "Allow update for authenticated admins or anon users"
  ON mosque_prayer_times FOR UPDATE
  USING (
    (select auth.role()) = 'anon' OR
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  )
  WITH CHECK (
    (select auth.role()) = 'anon' OR
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );