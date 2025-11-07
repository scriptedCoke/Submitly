-- Drop all triggers and functions with CASCADE to handle dependencies
-- Then recreate with correct column names: total_storage_bytes and total_submissions

-- Drop triggers first (if they exist)
DROP TRIGGER IF EXISTS update_profile_stats_on_submission_insert ON submissions;
DROP TRIGGER IF EXISTS update_profile_stats_on_submission_delete ON submissions;

-- Drop functions with CASCADE to remove all dependencies
DROP FUNCTION IF EXISTS update_profile_stats() CASCADE;
DROP FUNCTION IF EXISTS update_profile_stats_on_delete() CASCADE;

-- Recreate the function to update profile stats when submission is inserted
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
DECLARE
  creator_id UUID;
BEGIN
  -- Get the creator_id from the inboxes table
  SELECT user_id INTO creator_id
  FROM inboxes
  WHERE id = NEW.inbox_id;

  -- Update the profile stats
  UPDATE profiles
  SET 
    total_storage_bytes = total_storage_bytes + NEW.file_size,
    total_submissions = total_submissions + 1
  WHERE id = creator_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the function to update profile stats when submission is deleted
CREATE OR REPLACE FUNCTION update_profile_stats_on_delete()
RETURNS TRIGGER AS $$
DECLARE
  creator_id UUID;
BEGIN
  -- Get the creator_id from the inboxes table
  SELECT user_id INTO creator_id
  FROM inboxes
  WHERE id = OLD.inbox_id;

  -- Update the profile stats
  UPDATE profiles
  SET 
    total_storage_bytes = GREATEST(0, total_storage_bytes - OLD.file_size),
    total_submissions = GREATEST(0, total_submissions - 1)
  WHERE id = creator_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers
CREATE TRIGGER update_profile_stats_on_submission_insert
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();

CREATE TRIGGER update_profile_stats_on_submission_delete
  AFTER DELETE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats_on_delete();
