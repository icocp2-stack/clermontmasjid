/*
  # Remove Unused Indexes and Consolidate RLS Policies

  ## Overview
  This migration addresses security warnings by:
  1. Removing unused indexes to reduce database overhead
  2. Consolidating overlapping RLS policies for clearer security model

  ## Changes

  ### 1. Remove Unused Indexes
  The following indexes have not been used and are being removed:
  - idx_admin_users_created_by (on admin_users.created_by)
  - idx_imam_users_created_by (on imam_users.created_by)
  - idx_imam_youtube_videos_added_by (on imam_youtube_videos.added_by)
  - idx_quran_verses_themes_user_id (on quran_verses_themes.user_id)
  - idx_ramadan_verses_day_number (on ramadan_verses.day_number)
  - idx_imam_users_email (on imam_users.email)
  - idx_imam_posts_author (on imam_posts.author_id)
  - idx_imam_users_user_id (on imam_users.user_id)

  Note: These can be re-added later if query patterns show they are needed.

  ### 2. Consolidate Overlapping RLS Policies
  Replace "FOR ALL" policies with explicit operation-specific policies.
  This eliminates overlapping permissive policies and makes the security model clearer.

  #### imam_posts Table
  - Remove: "Admins can manage all posts" (FOR ALL)
  - Add explicit: INSERT, UPDATE, DELETE policies for admins

  #### imam_youtube_videos Table
  - Remove: "Admins can manage all videos" (FOR ALL)
  - Add explicit: UPDATE, DELETE policies for admins

  ## Security Benefits
  - Clearer separation of concerns in RLS policies
  - Easier to audit and understand access control
  - No overlapping policies that could mask security issues
  - Reduced database overhead from unused indexes
*/

-- ============================================================================
-- PART 1: Remove Unused Indexes
-- ============================================================================

-- Drop unused foreign key indexes
DROP INDEX IF EXISTS idx_admin_users_created_by;
DROP INDEX IF EXISTS idx_imam_users_created_by;
DROP INDEX IF EXISTS idx_imam_youtube_videos_added_by;
DROP INDEX IF EXISTS idx_quran_verses_themes_user_id;

-- Drop unused query indexes
DROP INDEX IF EXISTS idx_ramadan_verses_day_number;
DROP INDEX IF EXISTS idx_imam_users_email;
DROP INDEX IF EXISTS idx_imam_posts_author;
DROP INDEX IF EXISTS idx_imam_users_user_id;

-- ============================================================================
-- PART 2: Consolidate imam_posts RLS Policies
-- ============================================================================

-- Drop the overlapping "FOR ALL" policy
DROP POLICY IF EXISTS "Admins can manage all posts" ON imam_posts;

-- Add explicit policies for admins
CREATE POLICY "Admins can insert posts"
  ON imam_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Admins can update posts"
  ON imam_posts FOR UPDATE
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  )
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Admins can delete posts"
  ON imam_posts FOR DELETE
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

-- ============================================================================
-- PART 3: Consolidate imam_youtube_videos RLS Policies
-- ============================================================================

-- Drop the overlapping "FOR ALL" policy
DROP POLICY IF EXISTS "Admins can manage all videos" ON imam_youtube_videos;

-- Add explicit policies for admins (SELECT and INSERT already exist separately)
CREATE POLICY "Admins can update videos"
  ON imam_youtube_videos FOR UPDATE
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  )
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Admins can delete videos"
  ON imam_youtube_videos FOR DELETE
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );
