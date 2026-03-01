/*
  # Add Foreign Key Indexes

  ## Overview
  This migration adds indexes to all foreign key columns to ensure optimal database performance.
  Foreign key columns should always be indexed to support:
  - Fast foreign key constraint validation
  - Efficient CASCADE operations (DELETE/UPDATE)
  - Improved JOIN performance
  - Better query optimization

  ## Changes
  Adding indexes to foreign key columns in:
  1. admin_users.created_by
  2. imam_users.created_by
  3. imam_posts.author_id
  4. imam_youtube_videos.added_by
  5. quran_verses_themes.user_id

  ## Benefits
  - Faster foreign key constraint checks during INSERT/UPDATE
  - Improved CASCADE DELETE/UPDATE performance
  - Better support for JOIN operations
  - Reduced lock contention on parent tables

  ## Performance Impact
  - Minimal overhead on writes
  - Significant improvement in constraint validation and cascades
*/

-- Add index for admin_users foreign key
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by 
ON admin_users(created_by);

-- Add index for imam_users foreign key
CREATE INDEX IF NOT EXISTS idx_imam_users_created_by 
ON imam_users(created_by);

-- Add index for imam_posts foreign key
CREATE INDEX IF NOT EXISTS idx_imam_posts_author_id 
ON imam_posts(author_id);

-- Add index for imam_youtube_videos foreign key
CREATE INDEX IF NOT EXISTS idx_imam_youtube_videos_added_by 
ON imam_youtube_videos(added_by);

-- Add index for quran_verses_themes foreign key
CREATE INDEX IF NOT EXISTS idx_quran_verses_themes_user_id 
ON quran_verses_themes(user_id);
