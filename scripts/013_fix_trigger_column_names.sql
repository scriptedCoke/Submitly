-- Fix trigger functions to use correct column names from profiles table
-- The profiles table has 'total_storage_bytes' and 'total_submissions', not 'storage_used'

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_profile_stats_trigger ON submissions;
DROP FUNCTION IF EXISTS update_profile_stats();

-- Recreate the function with correct column names
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile stats when a new submission is created
  UPDATE profiles
  SET 
    total_submissions = total_submissions + 1,
    total_storage_bytes = total_storage_bytes + NEW.file_size
  WHERE id = (
    SELECT creator_id 
    FROM inboxes 
    WHERE id = NEW.inbox_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER update_profile_stats_trigger
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();

-- Also create a trigger for when submissions are deleted
DROP TRIGGER IF EXISTS update_profile_stats_on_delete_trigger ON submissions;
DROP FUNCTION IF EXISTS update_profile_stats_on_delete();

CREATE OR REPLACE FUNCTION update_profile_stats_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile stats when a submission is deleted
  UPDATE profiles
  SET 
    total_submissions = GREATEST(0, total_submissions - 1),
    total_storage_bytes = GREATEST(0, total_storage_bytes - OLD.file_size)
  WHERE id = (
    SELECT creator_id 
    FROM inboxes 
    WHERE id = OLD.inbox_id
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_profile_stats_on_delete_trigger
  AFTER DELETE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats_on_delete();
