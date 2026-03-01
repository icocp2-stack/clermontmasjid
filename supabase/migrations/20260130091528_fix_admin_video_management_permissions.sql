/*
  # Fix Admin Video Management Permissions

  ## Overview
  Updates RLS policies for imam_youtube_videos and imam_posts to allow admins
  to manage all content, in addition to users with specific permissions.

  ## Changes
  
  1. Video Management Policies
    - Admins OR users with can_manage_videos can insert/update/delete videos
    - Removes the restriction that users can only delete their own videos
    
  2. Post Management Policies
    - Admins OR users with can_manage_posts can insert posts
    - Admins can update/delete any post, not just their own
  
  ## Security Notes
  - Admins (is_admin = true) have full control over all content
  - Users with specific permissions (can_manage_videos, can_manage_posts) can manage content
  - Published content remains publicly readable
*/

-- Update video management policies to include admins

DROP POLICY IF EXISTS "Video managers can insert videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Video managers can update videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Video managers can delete own videos" ON imam_youtube_videos;

-- Admins or users with can_manage_videos can insert videos
CREATE POLICY "Admins and video managers can insert videos"
  ON imam_youtube_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND (is_admin = true OR can_manage_videos = true)
    )
  );

-- Admins or users with can_manage_videos can update videos
CREATE POLICY "Admins and video managers can update videos"
  ON imam_youtube_videos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND (is_admin = true OR can_manage_videos = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND (is_admin = true OR can_manage_videos = true)
    )
  );

-- Admins or users with can_manage_videos can delete videos
CREATE POLICY "Admins and video managers can delete videos"
  ON imam_youtube_videos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND (is_admin = true OR can_manage_videos = true)
    )
  );

-- Update post management policies to include admins

DROP POLICY IF EXISTS "Post managers can insert posts" ON imam_posts;
DROP POLICY IF EXISTS "Post managers can update own posts" ON imam_posts;
DROP POLICY IF EXISTS "Post managers can delete own posts" ON imam_posts;

-- Admins or users with can_manage_posts can insert posts
CREATE POLICY "Admins and post managers can insert posts"
  ON imam_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND (is_admin = true OR can_manage_posts = true)
    )
  );

-- Admins can update any post, users can update their own
CREATE POLICY "Admins and post managers can update posts"
  ON imam_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND (
        is_admin = true OR 
        (can_manage_posts = true AND author_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND (
        is_admin = true OR 
        (can_manage_posts = true AND author_id = auth.uid())
      )
    )
  );

-- Admins can delete any post, users can delete their own
CREATE POLICY "Admins and post managers can delete posts"
  ON imam_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND (
        is_admin = true OR 
        (can_manage_posts = true AND author_id = auth.uid())
      )
    )
  );