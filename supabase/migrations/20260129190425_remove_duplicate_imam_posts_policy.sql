/*
  # Remove Duplicate imam_posts SELECT Policy

  ## Overview
  This migration fixes overlapping RLS policies on the imam_posts table by removing
  the generic "Anyone can view published posts" policy that applies to multiple roles.

  ## Issue
  The table currently has overlapping policies:
  - For anon role: "Anyone can view published posts" + "Public can view published posts"
  - For authenticated role: "Anyone can view published posts" + "Authenticated users can view posts"

  ## Solution
  Remove the generic "Anyone can view published posts" policy and keep the role-specific policies:
  - "Public can view published posts" (for anon)
  - "Authenticated users can view posts" (for authenticated)

  ## Benefits
  - Eliminates policy overlap warnings
  - Clearer role-based access control
  - Easier to audit and maintain
*/

-- Remove the generic policy that applies to multiple roles
DROP POLICY IF EXISTS "Anyone can view published posts" ON imam_posts;
