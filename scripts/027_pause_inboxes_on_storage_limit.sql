-- Trigger to automatically pause inboxes when storage limit is reached
CREATE OR REPLACE FUNCTION pause_inboxes_on_storage_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has exceeded 200MB storage (only for basic plan)
  IF NEW.subscription_tier = 'basic' THEN
    -- Pause all inboxes if storage >= 200MB
    UPDATE inboxes
    SET is_paused = true
    WHERE creator_id = NEW.id
    AND total_storage_bytes >= 200 * 1024 * 1024;

    -- Unpause all inboxes if storage < 200MB
    UPDATE inboxes
    SET is_paused = false
    WHERE creator_id = NEW.id
    AND total_storage_bytes < 200 * 1024 * 1024
    AND is_paused = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_pause_inboxes_on_storage_limit ON profiles;

-- Create trigger to run after profile update
CREATE TRIGGER trigger_pause_inboxes_on_storage_limit
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION pause_inboxes_on_storage_limit();

-- Also run the trigger logic after submission insert
CREATE OR REPLACE FUNCTION check_storage_limit_after_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the inbox creator
  UPDATE profiles
  SET updated_at = now()
  WHERE id = (SELECT creator_id FROM inboxes WHERE id = NEW.inbox_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_check_storage_after_submission ON submissions;

-- Create trigger
CREATE TRIGGER trigger_check_storage_after_submission
AFTER INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION check_storage_limit_after_submission();
