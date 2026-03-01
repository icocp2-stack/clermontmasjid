/*
  # Remove Unused Foreign Key Indexes

  ## Overview
  This migration removes foreign key indexes that are not being used by the application,
  improving write performance and reducing storage overhead.

  ## Analysis
  After analyzing application queries, the following indexes have never been used:
  - `idx_admin_users_created_by` - created_by is metadata only, never queried
  - `idx_imam_users_created_by` - created_by is metadata only, never queried
  - `idx_imam_posts_author_id` - author_id used only in RLS with auth.uid(), no JOINs
  - `idx_imam_youtube_videos_added_by` - added_by is metadata only, never queried
  - `idx_quran_verses_themes_user_id` - duplicate of existing idx_quran_verses_user

  ## Benefits
  - Faster INSERT and UPDATE operations (no index maintenance overhead)
  - Reduced storage space
  - Cleaner database schema
  - No impact on query performance (indexes weren't being used)

  ## Notes
  - The foreign key constraints themselves remain in place for data integrity
  - If future queries need these indexes, they can be added back based on actual usage patterns
  - The existing `idx_quran_verses_user` index on quran_verses_themes(user_id) is retained
*/

-- Remove unused foreign key indexes
DROP INDEX IF EXISTS idx_admin_users_created_by;
DROP INDEX IF EXISTS idx_imam_users_created_by;
DROP INDEX IF EXISTS idx_imam_posts_author_id;
DROP INDEX IF EXISTS idx_imam_youtube_videos_added_by;

-- Remove duplicate index (idx_quran_verses_user already exists on same column)
DROP INDEX IF EXISTS idx_quran_verses_themes_user_id;
