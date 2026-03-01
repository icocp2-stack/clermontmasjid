/*
  # Fix Foreign Key Indexes - Final

  ## Changes Made

  ### 1. Remove Unused Indexes
  - Remove idx_imam_posts_author_id (not used by queries)
  - Remove idx_quran_verses_themes_user_id (not used by queries)

  ### 2. Add Foreign Key Indexes for Active Tables
  - Add index for imam_youtube_videos.added_by
  - Add index for netlify_config.updated_by
  - Add index for prayer_time_adjustments.created_by
  - Add index for ramadan_tarawih_videos.added_by

  ## Security Notes
  - Only indexes for actively queried foreign keys are maintained
  - Removes indexes that aren't utilized to improve write performance
*/

-- =====================================================
-- 1. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_imam_posts_author_id;
DROP INDEX IF EXISTS idx_quran_verses_themes_user_id;

-- =====================================================
-- 2. ADD FOREIGN KEY INDEXES FOR ACTIVE TABLES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_imam_youtube_videos_added_by 
  ON imam_youtube_videos(added_by);

CREATE INDEX IF NOT EXISTS idx_netlify_config_updated_by 
  ON netlify_config(updated_by);

CREATE INDEX IF NOT EXISTS idx_prayer_time_adjustments_created_by 
  ON prayer_time_adjustments(created_by);

CREATE INDEX IF NOT EXISTS idx_ramadan_tarawih_videos_added_by 
  ON ramadan_tarawih_videos(added_by);