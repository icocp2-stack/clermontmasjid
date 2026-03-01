/*
  # Optimize Foreign Key Indexes

  ## Changes Made

  ### 1. Remove Unused Indexes
  - Remove idx_imam_youtube_videos_added_by (not actively queried)
  - Remove idx_netlify_config_updated_by (not actively queried)
  - Remove idx_prayer_time_adjustments_created_by (not actively queried)
  - Remove idx_ramadan_tarawih_videos_added_by (not actively queried)

  ### 2. Add Foreign Key Indexes for Actively Queried Tables
  - Add index for imam_posts.author_id (actively queried)
  - Add index for quran_verses_themes.user_id (actively queried)

  ## Performance Notes
  - Indexes are only maintained for foreign keys that are actually used in queries
  - Removing unused indexes improves write performance and reduces storage overhead
  - Adding indexes for actively queried foreign keys improves join performance
*/

-- =====================================================
-- 1. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_imam_youtube_videos_added_by;
DROP INDEX IF EXISTS idx_netlify_config_updated_by;
DROP INDEX IF EXISTS idx_prayer_time_adjustments_created_by;
DROP INDEX IF EXISTS idx_ramadan_tarawih_videos_added_by;

-- =====================================================
-- 2. ADD FOREIGN KEY INDEXES FOR ACTIVELY QUERIED TABLES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_imam_posts_author_id 
  ON imam_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_quran_verses_themes_user_id 
  ON quran_verses_themes(user_id);