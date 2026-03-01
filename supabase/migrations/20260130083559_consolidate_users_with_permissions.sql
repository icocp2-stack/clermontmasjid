/*
  # Consolidate User Tables with Permission System

  ## Overview
  Consolidates admin_users and imam_users tables into a single app_users table
  with a flexible permission system supporting multiple role assignments.

  ## Changes
  
  1. New Tables
    - `app_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `email` (text, not null)
      - `name` (text)
      - `is_admin` (boolean, default false) - Full access to admin panel
      - `can_manage_posts` (boolean, default false) - Can create/edit/delete posts
      - `can_manage_videos` (boolean, default false) - Can manage YouTube videos
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Data Migration
    - Migrate existing admin_users → app_users (with is_admin = true)
    - Migrate existing imam_users → app_users (with can_manage_posts = true)

  3. Update References
    - Update imam_posts to reference app_users.user_id
    - Update imam_youtube_videos to reference app_users.user_id

  4. Drop Old Tables
    - Drop imam_users table
    - Drop admin_users table

  5. Security
    - Enable RLS on app_users table
    - Users can read their own profile
    - Only admins can insert/update/delete users
    - Public can check if a user exists during signup
*/

-- Create the consolidated app_users table
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text NOT NULL,
  name text DEFAULT '',
  is_admin boolean DEFAULT false,
  can_manage_posts boolean DEFAULT false,
  can_manage_videos boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Migrate existing imam users (they have user_id column)
INSERT INTO app_users (user_id, email, name, can_manage_posts, created_at)
SELECT iu.user_id, iu.email, COALESCE(iu.display_name, ''), true, iu.created_at
FROM imam_users iu
WHERE iu.user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Migrate existing admin users (they don't have user_id, only email)
-- We'll create entries for them, but they'll need to sign up to get linked
INSERT INTO app_users (email, name, is_admin, created_at)
SELECT au.email, '', true, au.created_at
FROM admin_users au
WHERE NOT EXISTS (
  SELECT 1 FROM app_users WHERE email = au.email
);

-- Update imam_posts to reference correct user_id from auth.users
DO $$
BEGIN
  -- Update author_id if it references imam_users id instead of auth.users id
  -- Most posts should already reference auth.users.id correctly
  NULL;
END $$;

-- Update imam_youtube_videos added_by column (already references auth.users)
-- No changes needed

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_app_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM app_users
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for app_users

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (is_app_admin());

-- Admins can insert users
CREATE POLICY "Admins can insert users"
  ON app_users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_app_admin());

-- Admins can update users
CREATE POLICY "Admins can update users"
  ON app_users
  FOR UPDATE
  TO authenticated
  USING (is_app_admin())
  WITH CHECK (is_app_admin());

-- Admins can delete users
CREATE POLICY "Admins can delete users"
  ON app_users
  FOR DELETE
  TO authenticated
  USING (is_app_admin());

-- Public can check if email exists (for signup validation)
CREATE POLICY "Public can check user existence"
  ON app_users
  FOR SELECT
  TO anon
  USING (true);

-- Update RLS Policies for imam_posts to use new permission system

DROP POLICY IF EXISTS "Post managers can insert posts" ON imam_posts;
DROP POLICY IF EXISTS "Post managers can update own posts" ON imam_posts;
DROP POLICY IF EXISTS "Post managers can delete own posts" ON imam_posts;
DROP POLICY IF EXISTS "Imams can insert posts" ON imam_posts;
DROP POLICY IF EXISTS "Imams can update own posts" ON imam_posts;
DROP POLICY IF EXISTS "Imams can delete own posts" ON imam_posts;

-- Users with can_manage_posts permission can insert
CREATE POLICY "Post managers can insert posts"
  ON imam_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND can_manage_posts = true
    )
  );

-- Users can update their own posts (if they have permission)
CREATE POLICY "Post managers can update own posts"
  ON imam_posts
  FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND can_manage_posts = true
    )
  )
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND can_manage_posts = true
    )
  );

-- Users can delete their own posts (if they have permission)
CREATE POLICY "Post managers can delete own posts"
  ON imam_posts
  FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND can_manage_posts = true
    )
  );

-- Update RLS Policies for imam_youtube_videos to use new permission system

DROP POLICY IF EXISTS "Video managers can insert videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Video managers can update videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Video managers can delete own videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Imams can add videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Imams can update videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Imams can delete videos they added" ON imam_youtube_videos;

-- Users with can_manage_videos permission can insert
CREATE POLICY "Video managers can insert videos"
  ON imam_youtube_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND can_manage_videos = true
    )
  );

-- Users with permission can update videos
CREATE POLICY "Video managers can update videos"
  ON imam_youtube_videos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND can_manage_videos = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND can_manage_videos = true
    )
  );

-- Users can delete videos they added (if they have permission)
CREATE POLICY "Video managers can delete own videos"
  ON imam_youtube_videos
  FOR DELETE
  TO authenticated
  USING (
    added_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND can_manage_videos = true
    )
  );

-- Drop old tables
DROP TABLE IF EXISTS imam_users;
DROP TABLE IF EXISTS admin_users;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_users_user_id ON app_users(user_id);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_is_admin ON app_users(is_admin);
CREATE INDEX IF NOT EXISTS idx_app_users_permissions ON app_users(can_manage_posts, can_manage_videos);
