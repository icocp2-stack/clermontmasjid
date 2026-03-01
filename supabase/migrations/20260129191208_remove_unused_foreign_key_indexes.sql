/*
  # Remove Unused Foreign Key Indexes

  ## Overview
  This migration removes indexes that were added to foreign key columns but are not being
  utilized in the application's query patterns. After analysis, these indexes provide minimal
  benefit while adding overhead to write operations.

  ## Analysis Results
  - All foreign keys use NO ACTION for update/delete (except quran_verses_themes.user_id)
  - None of these indexed columns are accessed in recent queries
  - Foreign key constraint validation overhead is minimal without high write volume
  - The indexes are not used for JOINs or WHERE clauses in the current application

  ## Indexes Being Removed
  1. idx_admin_users_created_by - Not queried, NO ACTION constraint
  2. idx_imam_users_created_by - Not queried, NO ACTION constraint
  3. idx_imam_posts_author_id - Not queried in SELECT, NO ACTION constraint
  4. idx_imam_youtube_videos_added_by - Not queried, NO ACTION constraint
  5. idx_quran_verses_themes_user_id - Not queried, CASCADE on delete but minimal usage

  ## Impact
  - Reduced write overhead (INSERT, UPDATE, DELETE operations)
  - Slightly increased foreign key constraint validation time (negligible in practice)
  - No impact on current query performance since indexes weren't being used
  - Foreign key constraints remain fully functional

  ## Note
  If future queries start using these columns (e.g., "show all posts by author X" or 
  "who created this admin"), indexes can be added back as needed.
*/

-- Remove unused foreign key indexes
DROP INDEX IF EXISTS idx_admin_users_created_by;
DROP INDEX IF EXISTS idx_imam_users_created_by;
DROP INDEX IF EXISTS idx_imam_posts_author_id;
DROP INDEX IF EXISTS idx_imam_youtube_videos_added_by;
DROP INDEX IF EXISTS idx_quran_verses_themes_user_id;
