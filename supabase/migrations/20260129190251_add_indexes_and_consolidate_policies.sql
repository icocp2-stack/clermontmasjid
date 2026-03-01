/*
  # Add Foreign Key Indexes and Consolidate RLS Policies

  ## Overview
  This migration addresses security and performance warnings by:
  1. Adding back foreign key indexes for optimal query performance
  2. Consolidating overlapping RLS policies into single policies with OR logic

  ## Changes

  ### 1. Add Foreign Key Indexes
  Foreign key columns need indexes for optimal JOIN and CASCADE operations:
  - admin_users.created_by
  - imam_users.created_by
  - imam_posts.author_id
  - imam_youtube_videos.added_by
  - quran_verses_themes.user_id

  ### 2. Consolidate Overlapping RLS Policies
  Combine multiple permissive policies for the same role and operation into single policies.

  #### imam_posts Table
  - SELECT: Combine authenticated policies (admin view all + imam view own) into one
  - INSERT: Combine admin and imam insert policies
  - UPDATE: Combine admin and imam update policies

  #### imam_users Table
  - SELECT: Combine admin view all and imam view own into one policy
  - INSERT: Combine admin insert and self-registration into one policy

  #### imam_youtube_videos Table
  - SELECT: Combine authenticated policies (admin view all + public view active)

  ## Benefits
  - Improved JOIN and CASCADE performance with proper indexes
  - Clearer security model with consolidated policies
  - Easier to audit and maintain
*/

-- ============================================================================
-- PART 1: Add Foreign Key Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_admin_users_created_by ON admin_users(created_by);
CREATE INDEX IF NOT EXISTS idx_imam_users_created_by ON imam_users(created_by);
CREATE INDEX IF NOT EXISTS idx_imam_posts_author_id ON imam_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_imam_youtube_videos_added_by ON imam_youtube_videos(added_by);

-- Add index for quran_verses_themes if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quran_verses_themes') THEN
    CREATE INDEX IF NOT EXISTS idx_quran_verses_themes_user_id ON quran_verses_themes(user_id);
  END IF;
END $$;

-- ============================================================================
-- PART 2: Consolidate imam_posts RLS Policies
-- ============================================================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Admins can view all posts" ON imam_posts;
DROP POLICY IF EXISTS "Imams can view their own posts" ON imam_posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON imam_posts;
DROP POLICY IF EXISTS "Imams can insert their own posts" ON imam_posts;
DROP POLICY IF EXISTS "Admins can update posts" ON imam_posts;
DROP POLICY IF EXISTS "Imams can update their own posts" ON imam_posts;

-- Create consolidated policies with OR logic
CREATE POLICY "Authenticated users can view posts"
  ON imam_posts FOR SELECT
  TO authenticated
  USING (
    is_published = true OR
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid()))) OR
    (author_id = (select auth.uid()) AND is_imam((SELECT email FROM auth.users WHERE id = (select auth.uid()))))
  );

CREATE POLICY "Admins and imams can insert posts"
  ON imam_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid()))) OR
    (author_id = (select auth.uid()) AND is_imam((SELECT email FROM auth.users WHERE id = (select auth.uid()))))
  );

CREATE POLICY "Admins and imams can update posts"
  ON imam_posts FOR UPDATE
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid()))) OR
    (author_id = (select auth.uid()) AND is_imam((SELECT email FROM auth.users WHERE id = (select auth.uid()))))
  )
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid()))) OR
    (author_id = (select auth.uid()) AND is_imam((SELECT email FROM auth.users WHERE id = (select auth.uid()))))
  );

-- Keep the public policy separate for unauthenticated users
CREATE POLICY "Public can view published posts"
  ON imam_posts FOR SELECT
  TO anon
  USING (is_published = true);

-- ============================================================================
-- PART 3: Consolidate imam_users RLS Policies
-- ============================================================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Admins can view all imam users" ON imam_users;
DROP POLICY IF EXISTS "Imams can read own profile" ON imam_users;
DROP POLICY IF EXISTS "Admins can insert new imam users" ON imam_users;
DROP POLICY IF EXISTS "Users can register as imams with own email" ON imam_users;

-- Create consolidated policies
CREATE POLICY "Authenticated users can view imam profiles"
  ON imam_users FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid()))) OR
    user_id = (select auth.uid())
  );

CREATE POLICY "Admins and users can insert imam records"
  ON imam_users FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid()))) OR
    (user_id = (select auth.uid()) AND email = (SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

-- ============================================================================
-- PART 4: Consolidate imam_youtube_videos RLS Policies
-- ============================================================================

-- Drop existing overlapping SELECT policies
DROP POLICY IF EXISTS "Admins can view all videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Anyone can view active videos" ON imam_youtube_videos;

-- Create consolidated policy for SELECT
CREATE POLICY "Users can view videos"
  ON imam_youtube_videos FOR SELECT
  USING (
    is_active = true OR
    (auth.uid() IS NOT NULL AND is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid()))))
  );
