/*
  # Clean Up Duplicate RLS Policies for Videos

  ## Overview
  Removes old duplicate policies that use is_admin() and is_imam() functions,
  keeping only the new policies that use the app_users table.

  ## Changes
  - Drop old policies using is_admin() and is_imam() functions
  - Keep only the new app_users-based policies
*/

-- Drop old duplicate policies that use is_admin() and is_imam() functions
DROP POLICY IF EXISTS "Admins and Imams can insert videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Admins can delete videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Admins can update videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Imams can delete their own videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Users can view videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Anyone can view active videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Admins can view all videos" ON imam_youtube_videos;
DROP POLICY IF EXISTS "Admins can manage all videos" ON imam_youtube_videos;

-- Create a simple SELECT policy for public viewing of active videos
CREATE POLICY "Public can view active videos"
  ON imam_youtube_videos
  FOR SELECT
  USING (is_active = true);

-- Create SELECT policy for authenticated users with permissions to view all videos
CREATE POLICY "Admins and video managers can view all videos"
  ON imam_youtube_videos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE user_id = auth.uid()
      AND (is_admin = true OR can_manage_videos = true)
    )
  );