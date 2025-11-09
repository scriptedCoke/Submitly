-- Create a function to update storage after deletion
CREATE OR REPLACE FUNCTION update_storage_after_delete(file_size_bytes BIGINT)
RETURNS void AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the current user ID from auth
  user_id := auth.uid();
  
  -- Update total_storage_bytes, ensuring it doesn't go below 0
  UPDATE profiles
  SET total_storage_bytes = GREATEST(0, total_storage_bytes - file_size_bytes)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_storage_after_delete(BIGINT) TO authenticated;
