/*
  # Add Foreign Key Indexes

  ## Overview
  This migration adds indexes to all foreign key columns to ensure optimal query performance
  and follow database best practices.

  ## Why Foreign Key Indexes Are Important
  1. **Query Performance**: Filtering by foreign keys (e.g., "show all posts by this author")
  2. **Constraint Validation**: Faster foreign key constraint checks on INSERT/UPDATE
  3. **Parent Table Operations**: DELETE/UPDATE operations on parent tables scan child tables
  4. **Join Performance**: JOIN operations benefit from indexes on both sides
  5. **Best Practice**: Standard recommendation for all foreign key columns

  ## Query Pattern Analysis
  - `imam_posts.author_id` - ACTIVELY USED in WHERE clause: `.eq('author_id', user?.id)`
  - Other columns - Currently only used in INSERTs, but indexes prevent future bottlenecks

  ## Indexes Being Added
  1. idx_admin_users_created_by - admin_users(created_by) → auth.users(id)
  2. idx_imam_users_created_by - imam_users(created_by) → auth.users(id)
  3. idx_imam_posts_author_id - imam_posts(author_id) → auth.users(id) [ACTIVELY QUERIED]
  4. idx_imam_youtube_videos_added_by - imam_youtube_videos(added_by) → auth.users(id)
  5. idx_quran_verses_themes_user_id - quran_verses_themes(user_id) → auth.users(id) [CASCADE DELETE]

  ## Performance Impact
  - Minimal write overhead (small tables, low write volume)
  - Significant read performance improvement for filtered queries
  - Faster constraint validation
  - Better scalability as tables grow

  ## Note
  The quran_verses_themes.user_id foreign key has CASCADE DELETE, making its index
  particularly important for performance when users are deleted.
*/

-- Add indexes for foreign key columns
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by ON admin_users(created_by);
CREATE INDEX IF NOT EXISTS idx_imam_users_created_by ON imam_users(created_by);
CREATE INDEX IF NOT EXISTS idx_imam_posts_author_id ON imam_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_imam_youtube_videos_added_by ON imam_youtube_videos(added_by);
CREATE INDEX IF NOT EXISTS idx_quran_verses_themes_user_id ON quran_verses_themes(user_id);
