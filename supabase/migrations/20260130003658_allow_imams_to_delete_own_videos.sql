/*
  # Allow Imams to Delete Their Own Videos

  1. Changes
    - Add RLS policy to allow imams to delete videos they added
  
  2. Security
    - Imams can only delete videos where added_by matches their user ID
    - Maintains existing admin permissions
*/

CREATE POLICY "Imams can delete their own videos"
  ON imam_youtube_videos FOR DELETE
  TO authenticated
  USING (
    added_by = auth.uid()
  );
