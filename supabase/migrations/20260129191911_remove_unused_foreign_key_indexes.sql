/*
  # Remove Unused Foreign Key Indexes

  ## Overview
  This migration removes indexes that are not actively used by queries or RLS policies,
  reducing write overhead while keeping indexes that provide actual performance benefits.

  ## Analysis of Index Usage

  ### Indexes Being REMOVED (unused):
  1. **idx_admin_users_created_by** - admin_users(created_by)
     - Only used in INSERT statements
     - No SELECT queries filter by this column
     - No RLS policies use this column
     - Result: Write overhead with no read benefit

  2. **idx_imam_users_created_by** - imam_users(created_by)
     - Only used in INSERT statements
     - No SELECT queries filter by this column
     - No RLS policies use this column
     - Result: Write overhead with no read benefit

  3. **idx_imam_youtube_videos_added_by** - imam_youtube_videos(added_by)
     - Only used in INSERT statements
     - No SELECT queries filter by this column
     - No RLS policies use this column
     - Result: Write overhead with no read benefit

  ### Indexes Being KEPT (actively used):
  1. **idx_imam_posts_author_id** - imam_posts(author_id)
     - ✓ Used by RLS policies: "Imams can view their own posts" checks author_id = auth.uid()
     - ✓ Used by RLS policies: "Imams can update their own posts" checks author_id = auth.uid()
     - ✓ Used by explicit query: .eq('author_id', user?.id) in ImamDashboard
     - Result: Critical for performance

  2. **idx_quran_verses_themes_user_id** - quran_verses_themes(user_id)
     - ✓ Used by RLS policies that check auth.uid() = user_id
     - ✓ Has ON DELETE CASCADE - index improves performance when users are deleted
     - Result: Beneficial for both reads and cascading deletes

  ## Performance Impact
  - Removes unnecessary write overhead on 3 tables
  - Maintains optimal read performance for actively queried columns
  - Follows best practice: only index columns that are actually queried
*/

-- Remove unused indexes that provide no query benefit
DROP INDEX IF EXISTS idx_admin_users_created_by;
DROP INDEX IF EXISTS idx_imam_users_created_by;
DROP INDEX IF EXISTS idx_imam_youtube_videos_added_by;

-- Note: Keeping idx_imam_posts_author_id (actively queried)
-- Note: Keeping idx_quran_verses_themes_user_id (RLS policies + CASCADE DELETE)
