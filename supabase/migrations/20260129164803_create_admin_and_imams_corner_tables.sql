/*
  # Create Admin and Imam's Corner System

  ## Overview
  This migration creates the complete infrastructure for role-based access control,
  allowing administrators to manage the system and imams to post content.

  ## 1. New Tables
  
  ### `admin_users`
  Stores the list of admin email addresses who have full system access.
  - `id` (uuid, primary key) - Unique identifier
  - `email` (text, unique, not null) - Admin email address
  - `created_at` (timestamptz) - When admin was added
  - `created_by` (uuid) - Which admin added this user
  
  ### `imam_users`
  Stores the list of imam email addresses who can post to Imam's Corner.
  - `id` (uuid, primary key) - Unique identifier
  - `email` (text, unique, not null) - Imam email address
  - `display_name` (text) - Public display name for the imam
  - `created_at` (timestamptz) - When imam was added
  - `created_by` (uuid) - Which admin added this imam

  ### `imam_posts`
  Stores documents, announcements, and content posted by imams.
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text, not null) - Post title
  - `content` (text, not null) - Post content (markdown supported)
  - `post_type` (text) - Type: 'announcement', 'document', 'article'
  - `author_id` (uuid) - Reference to auth.users
  - `author_name` (text) - Display name of author
  - `is_published` (boolean) - Published status
  - `published_at` (timestamptz) - When published
  - `created_at` (timestamptz) - When created
  - `updated_at` (timestamptz) - When last updated

  ### `imam_youtube_videos`
  Stores YouTube videos/playlists featured in Imam's Corner.
  - `id` (uuid, primary key) - Unique identifier
  - `video_id` (text, not null) - YouTube video ID
  - `title` (text) - Video title
  - `description` (text) - Video description
  - `thumbnail_url` (text) - Video thumbnail URL
  - `playlist_id` (text) - Optional playlist ID
  - `display_order` (integer) - Display order
  - `is_active` (boolean) - Whether to show video
  - `added_by` (uuid) - Who added the video
  - `created_at` (timestamptz) - When added

  ## 2. Security
  - Enable RLS on all tables
  - Admins can manage everything
  - Imams can only manage their own posts
  - Public can read published content only

  ## 3. Helper Functions
  - `is_admin(email)` - Check if user is admin
  - `is_imam(email)` - Check if user is imam

  ## 4. Important Notes
  - Admins have full access to manage users and all content
  - Imams can only post and edit their own content
  - All published content is publicly readable
  - YouTube videos require admin or imam approval
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create imam_users table
CREATE TABLE IF NOT EXISTS imam_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create imam_posts table
CREATE TABLE IF NOT EXISTS imam_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  post_type text DEFAULT 'article',
  author_id uuid REFERENCES auth.users(id),
  author_name text,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create imam_youtube_videos table
CREATE TABLE IF NOT EXISTS imam_youtube_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  title text,
  description text,
  thumbnail_url text,
  playlist_id text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  added_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is imam
CREATE OR REPLACE FUNCTION is_imam(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM imam_users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE imam_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE imam_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE imam_youtube_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can insert new admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- RLS Policies for imam_users
CREATE POLICY "Admins can view all imam users"
  ON imam_users FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can insert new imam users"
  ON imam_users FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can update imam users"
  ON imam_users FOR UPDATE
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can delete imam users"
  ON imam_users FOR DELETE
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- RLS Policies for imam_posts
CREATE POLICY "Anyone can view published posts"
  ON imam_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all posts"
  ON imam_posts FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Imams can view their own posts"
  ON imam_posts FOR SELECT
  TO authenticated
  USING (
    author_id = auth.uid() AND 
    is_imam((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Imams can insert their own posts"
  ON imam_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    is_imam((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Imams can update their own posts"
  ON imam_posts FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid() AND
    is_imam((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    author_id = auth.uid() AND
    is_imam((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can manage all posts"
  ON imam_posts FOR ALL
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- RLS Policies for imam_youtube_videos
CREATE POLICY "Anyone can view active videos"
  ON imam_youtube_videos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all videos"
  ON imam_youtube_videos FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admins and Imams can insert videos"
  ON imam_youtube_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid())) OR
    is_imam((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can manage all videos"
  ON imam_youtube_videos FOR ALL
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_imam_users_email ON imam_users(email);
CREATE INDEX IF NOT EXISTS idx_imam_posts_author ON imam_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_imam_posts_published ON imam_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_active ON imam_youtube_videos(is_active, display_order);