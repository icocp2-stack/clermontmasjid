/*
  # Fix is_admin function schema qualification

  1. Changes
    - Update is_admin function to use fully qualified table name (public.admin_users)
    - This fixes the "permission denied for table users" error caused by improper search_path handling
*/

CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE email = user_email
  );
END;
$$;