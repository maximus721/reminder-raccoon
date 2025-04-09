
-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.check_if_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = check_if_table_exists.table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Grant execute permission to the anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.check_if_table_exists(text) TO anon, authenticated;
