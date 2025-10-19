-- Drop triggers first, then functions, then recreate with correct column names

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_profile_stats_on_submission_insert ON submissions;
DROP TRIGGER IF EXISTS update_profile_stats_on_submission_delete ON submissions;

-- Now we can drop the functions
DROP FUNCTION IF EXISTS update_profile_stats();
DROP FUNCTION IF EXISTS update_profile_stats_on_delete();

-- Recreate the function with correct column names
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
DECLARE
  inbox_owner_id UUID;
BEGIN
  -- Get the owner of the inbox
  SELECT user_id INTO inbox_owner_id
  FROM inboxes
  WHERE id = NEW.inbox_id;

  -- Update the profile stats with correct column names
  UPDATE profiles
  SET 
    total_storage_bytes = total_storage_bytes + NEW.file_size,
    total_submissions = total_submissions + 1
  WHERE id = inbox_owner_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the delete function with correct column names
CREATE OR REPLACE FUNCTION update_profile_stats_on_delete()
RETURNS TRIGGER AS $$
DECLARE
  inbox_owner_id UUID;
BEGIN
  -- Get the owner of the inbox
  SELECT user_id INTO inbox_owner_id
  FROM inboxes
  WHERE id = OLD.inbox_id;

  -- Update the profile stats with correct column names
  UPDATE profiles
  SET 
    total_storage_bytes = GREATEST(0, total_storage_bytes - OLD.file_size),
    total_submissions = GREATEST(0, total_submissions - 1)
  WHERE id = inbox_owner_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers
CREATE TRIGGER update_profile_stats_on_submission_insert
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();

CREATE TRIGGER update_profile_stats_on_submission_delete
  AFTER DELETE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats_on_delete();
