/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses security and performance issues identified by Supabase:
  - Adds missing indexes on foreign keys for better query performance
  - Optimizes RLS policies to prevent auth.uid() re-evaluation on each row
  - Secures helper functions by setting search_path

  ## 1. Performance Improvements

  ### Add Missing Foreign Key Indexes
  - admin_users.created_by
  - imam_users.created_by
  - imam_youtube_videos.added_by
  - quran_verses_themes.user_id (if exists)

  ### Optimize RLS Policies
  Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row

  ## 2. Security Improvements

  ### Function Search Path
  - Set secure search_path on helper functions to prevent search_path injection attacks

  ## 3. Important Notes
  - Multiple permissive policies are intentional (OR'd together for flexibility)
  - "Allow public imam signup" policy is intentionally permissive for self-registration
  - Unused indexes will be used as the application scales
*/

-- ============================================================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================================================

-- Index for admin_users.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by ON admin_users(created_by);

-- Index for imam_users.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_imam_users_created_by ON imam_users(created_by);

-- Index for imam_youtube_videos.added_by foreign key
CREATE INDEX IF NOT EXISTS idx_imam_youtube_videos_added_by ON imam_youtube_videos(added_by);

-- Index for quran_verses_themes.user_id foreign key (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quran_verses_themes') THEN
    CREATE INDEX IF NOT EXISTS idx_quran_verses_themes_user_id ON quran_verses_themes(user_id);
  END IF;
END $$;

-- ============================================================================
-- PART 2: Fix Helper Functions - Add Secure Search Path
-- ============================================================================

-- Recreate is_admin function with secure search_path
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Recreate is_imam function with secure search_path
CREATE OR REPLACE FUNCTION is_imam(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM imam_users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- PART 3: Optimize RLS Policies - Wrap auth.uid() in SELECT
-- ============================================================================

-- Drop and recreate admin_users policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert new admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can delete admin users" ON admin_users;

CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Admins can insert new admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Admins can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

-- Drop and recreate imam_users policies
DROP POLICY IF EXISTS "Admins can view all imam users" ON imam_users;
DROP POLICY IF EXISTS "Admins can insert new imam users" ON imam_users;
DROP POLICY IF EXISTS "Admins can update imam users" ON imam_users;
DROP POLICY IF EXISTS "Admins can delete imam users" ON imam_users;
DROP POLICY IF EXISTS "Imams can read own profile" ON imam_users;

CREATE POLICY "Admins can view all imam users"
  ON imam_users FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Admins can insert new imam users"
  ON imam_users FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Admins can update imam users"
  ON imam_users FOR UPDATE
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  )
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Admins can delete imam users"
  ON imam_users FOR DELETE
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Imams can read own profile"
  ON imam_users FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate imam_posts policies
DROP POLICY IF EXISTS "Admins can view all posts" ON imam_posts;
DROP POLICY IF EXISTS "Imams can view their own posts" ON imam_posts;
DROP POLICY IF EXISTS "Imams can insert their own posts" ON imam_posts;
DROP POLICY IF EXISTS "Imams can update their own posts" ON imam_posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON imam_posts;

CREATE POLICY "Admins can view all posts"
  ON imam_posts FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Imams can view their own posts"
  ON imam_posts FOR SELECT
  TO authenticated
  USING (
    author_id = (select auth.uid()) AND 
    is_imam((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Imams can insert their own posts"
  ON imam_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = (select auth.uid()) AND
    is_imam((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Imams can update their own posts"
  ON imam_posts FOR UPDATE
  TO authenticated
  USING (
    author_id = (select auth.uid()) AND
    is_imam((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  )
  WITH CHECK (
    author_id = (select auth.uid()) AND
    is_imam((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Admins can manage all posts"
  ON imam_posts FOR ALL
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  )
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

-- Drop and recreate imam_youtube_videos policies
DROP POLICY IF EXISTS "Admins can view all videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Admins and Imams can insert videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Admins can manage all videos" ON imam_youtube_videos;

CREATE POLICY "Admins can view all videos"
  ON imam_youtube_videos FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Admins and Imams can insert videos"
  ON imam_youtube_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid()))) OR
    is_imam((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );

CREATE POLICY "Admins can manage all videos"
  ON imam_youtube_videos FOR ALL
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  )
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = (select auth.uid())))
  );
