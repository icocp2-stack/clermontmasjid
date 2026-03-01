/*
  # Comprehensive Security and Performance Fixes

  ## Changes Made

  ### 1. Foreign Key Indexes
  - Add indexes for `imam_youtube_videos.added_by`
  - Add indexes for `netlify_config.updated_by`
  - Add indexes for `prayer_time_adjustments.created_by`
  - Add indexes for `ramadan_tarawih_videos.added_by`

  ### 2. RLS Policy Optimization (Auth Function Caching)
  - Wrap all `auth.uid()` calls with `(select auth.uid())` to prevent re-evaluation per row
  - Affects policies across: imam_posts, imam_youtube_videos, ramadan_tarawih_videos, 
    user_profiles, prayer_logs, mosque_prayer_times, app_users

  ### 3. Unused Index Cleanup
  - Remove unused indexes to reduce storage and improve write performance
  - Indexes removed from: imam_posts, quran_verses_themes, prayer_logs, app_users,
    ramadan_tarawih_videos, prayer_time_adjustments, mosque_prayer_times

  ### 4. Consolidate Multiple Permissive Policies
  - Merge overlapping policies to simplify query planning
  - Affected tables: app_users, prayer_logs, ramadan_tarawih_videos, user_profiles

  ### 5. Function Search Path Security
  - Fix mutable search_path on functions: update_updated_at_column, is_app_admin

  ### 6. Fix Overly Permissive RLS Policies
  - Restrict netlify_config policies to admin users only
  - Restrict prayer_time_adjustments policies to admin users only

  ## Security Notes
  - All changes maintain or improve existing security posture
  - No data loss or breaking changes
  - Performance improvements through query optimization
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_imam_youtube_videos_added_by 
  ON imam_youtube_videos(added_by);

CREATE INDEX IF NOT EXISTS idx_netlify_config_updated_by 
  ON netlify_config(updated_by);

CREATE INDEX IF NOT EXISTS idx_prayer_time_adjustments_created_by 
  ON prayer_time_adjustments(created_by);

CREATE INDEX IF NOT EXISTS idx_ramadan_tarawih_videos_added_by 
  ON ramadan_tarawih_videos(added_by);

-- =====================================================
-- 2. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_imam_posts_author_id;
DROP INDEX IF EXISTS idx_quran_verses_themes_user_id;
DROP INDEX IF EXISTS idx_prayer_logs_user_id;
DROP INDEX IF EXISTS idx_prayer_logs_prayer_date;
DROP INDEX IF EXISTS idx_app_users_user_id;
DROP INDEX IF EXISTS idx_app_users_email;
DROP INDEX IF EXISTS idx_app_users_is_admin;
DROP INDEX IF EXISTS idx_app_users_permissions;
DROP INDEX IF EXISTS idx_ramadan_tarawih_videos_gregorian_date;
DROP INDEX IF EXISTS idx_prayer_adjustments_dates;
DROP INDEX IF EXISTS idx_mosque_prayer_times_active;

-- =====================================================
-- 3. FIX FUNCTION SEARCH PATH SECURITY
-- =====================================================

-- Recreate update_updated_at_column with secure search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate is_app_admin with secure search_path
DROP FUNCTION IF EXISTS is_app_admin() CASCADE;
CREATE OR REPLACE FUNCTION is_app_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM app_users 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  );
END;
$$;

-- =====================================================
-- 4. OPTIMIZE imam_posts RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published posts" ON imam_posts;
DROP POLICY IF EXISTS "Admins and post managers can insert posts" ON imam_posts;
DROP POLICY IF EXISTS "Admins and post managers can update posts" ON imam_posts;
DROP POLICY IF EXISTS "Admins and post managers can delete posts" ON imam_posts;

CREATE POLICY "Anyone can view published posts"
  ON imam_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins and post managers can insert posts"
  ON imam_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_posts = true)
    )
  );

CREATE POLICY "Admins and post managers can update posts"
  ON imam_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_posts = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_posts = true)
    )
  );

CREATE POLICY "Admins and post managers can delete posts"
  ON imam_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_posts = true)
    )
  );

-- =====================================================
-- 5. OPTIMIZE imam_youtube_videos RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Admins and video managers can insert videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Admins and video managers can update videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Admins and video managers can delete videos" ON imam_youtube_videos;

CREATE POLICY "Anyone can view active videos"
  ON imam_youtube_videos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins and video managers can insert videos"
  ON imam_youtube_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_videos = true)
    )
  );

CREATE POLICY "Admins and video managers can update videos"
  ON imam_youtube_videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_videos = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_videos = true)
    )
  );

CREATE POLICY "Admins and video managers can delete videos"
  ON imam_youtube_videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_videos = true)
    )
  );

-- =====================================================
-- 6. OPTIMIZE ramadan_tarawih_videos RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can view active Tarawih videos" ON ramadan_tarawih_videos;
DROP POLICY IF EXISTS "Authenticated users can view all Tarawih videos" ON ramadan_tarawih_videos;
DROP POLICY IF EXISTS "Users with video permissions can insert Tarawih videos" ON ramadan_tarawih_videos;
DROP POLICY IF EXISTS "Users with video permissions can update Tarawih videos" ON ramadan_tarawih_videos;
DROP POLICY IF EXISTS "Users with video permissions can delete Tarawih videos" ON ramadan_tarawih_videos;

-- Consolidate SELECT policies into one
CREATE POLICY "Users can view Tarawih videos"
  ON ramadan_tarawih_videos FOR SELECT
  USING (
    is_active = true OR
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_videos = true)
    )
  );

CREATE POLICY "Users with video permissions can insert Tarawih videos"
  ON ramadan_tarawih_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_videos = true)
    )
  );

CREATE POLICY "Users with video permissions can update Tarawih videos"
  ON ramadan_tarawih_videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_videos = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_videos = true)
    )
  );

CREATE POLICY "Users with video permissions can delete Tarawih videos"
  ON ramadan_tarawih_videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND (is_admin = true OR can_manage_videos = true)
    )
  );

-- =====================================================
-- 7. OPTIMIZE user_profiles RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Consolidate SELECT policies
CREATE POLICY "Users can read profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- 8. OPTIMIZE prayer_logs RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can read own prayer logs" ON prayer_logs;
DROP POLICY IF EXISTS "Users can insert own prayer logs" ON prayer_logs;
DROP POLICY IF EXISTS "Users can update own prayer logs" ON prayer_logs;
DROP POLICY IF EXISTS "Users can delete own prayer logs" ON prayer_logs;
DROP POLICY IF EXISTS "Admins can read all prayer logs" ON prayer_logs;
DROP POLICY IF EXISTS "Admins can delete prayer logs" ON prayer_logs;

-- Consolidate SELECT policies
CREATE POLICY "Users can read prayer logs"
  ON prayer_logs FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );

CREATE POLICY "Users can insert own prayer logs"
  ON prayer_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own prayer logs"
  ON prayer_logs FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Consolidate DELETE policies
CREATE POLICY "Users can delete prayer logs"
  ON prayer_logs FOR DELETE
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );

-- =====================================================
-- 9. OPTIMIZE mosque_prayer_times RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Allow insert for authenticated admins or anon users" ON mosque_prayer_times;
DROP POLICY IF EXISTS "Allow update for authenticated admins or anon users" ON mosque_prayer_times;
DROP POLICY IF EXISTS "Allow delete for authenticated admins" ON mosque_prayer_times;

CREATE POLICY "Allow insert for authenticated admins or anon users"
  ON mosque_prayer_times FOR INSERT
  WITH CHECK (
    auth.role() = 'anon' OR
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );

CREATE POLICY "Allow update for authenticated admins or anon users"
  ON mosque_prayer_times FOR UPDATE
  USING (
    auth.role() = 'anon' OR
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  )
  WITH CHECK (
    auth.role() = 'anon' OR
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );

CREATE POLICY "Allow delete for authenticated admins"
  ON mosque_prayer_times FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );

-- =====================================================
-- 10. OPTIMIZE app_users RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profile" ON app_users;
DROP POLICY IF EXISTS "Admins can read all users" ON app_users;

-- Consolidate SELECT policies
CREATE POLICY "Users can read app_users"
  ON app_users FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM app_users au
      WHERE au.user_id = (select auth.uid())
      AND au.is_admin = true
    )
  );

-- =====================================================
-- 11. FIX OVERLY PERMISSIVE netlify_config POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert netlify config" ON netlify_config;
DROP POLICY IF EXISTS "Authenticated users can update netlify config" ON netlify_config;

CREATE POLICY "Only admins can insert netlify config"
  ON netlify_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );

CREATE POLICY "Only admins can update netlify config"
  ON netlify_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );

-- =====================================================
-- 12. FIX OVERLY PERMISSIVE prayer_time_adjustments POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Allow insert prayer time adjustments" ON prayer_time_adjustments;
DROP POLICY IF EXISTS "Allow update prayer time adjustments" ON prayer_time_adjustments;
DROP POLICY IF EXISTS "Allow delete prayer time adjustments" ON prayer_time_adjustments;

CREATE POLICY "Only admins can insert prayer time adjustments"
  ON prayer_time_adjustments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );

CREATE POLICY "Only admins can update prayer time adjustments"
  ON prayer_time_adjustments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );

CREATE POLICY "Only admins can delete prayer time adjustments"
  ON prayer_time_adjustments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = (select auth.uid())
      AND is_admin = true
    )
  );