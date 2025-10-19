-- Final comprehensive fix for all user_id references
-- This script will fix ALL references to user_id in the database

-- Step 1: Drop ALL policies on submissions table
DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON submissions;
DROP POLICY IF EXISTS "Inbox owners can view submissions" ON submissions;
DROP POLICY IF EXISTS "Anyone can insert submissions" ON submissions;
DROP POLICY IF EXISTS "Authenticated users can insert submissions" ON submissions;
DROP POLICY IF EXISTS "Users can view submissions" ON submissions;

-- Step 2: Drop ALL triggers on submissions table
DROP TRIGGER IF EXISTS update_profile_stats_trigger ON submissions;
DROP TRIGGER IF EXISTS update_storage_on_insert ON submissions;
DROP TRIGGER IF EXISTS update_storage_on_delete ON submissions;

-- Step 3: Drop and recreate the trigger functions with correct column names
DROP FUNCTION IF EXISTS update_profile_stats() CASCADE;
DROP FUNCTION IF EXISTS update_storage_on_submission_insert() CASCADE;
DROP FUNCTION IF EXISTS update_storage_on_submission_delete() CASCADE;

-- Step 4: Recreate trigger function with correct column names
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profile's total storage and submission count
  UPDATE profiles
  SET 
    total_storage_bytes = (
      SELECT COALESCE(SUM(file_size), 0)
      FROM submissions
      WHERE submitter_user_id = NEW.submitter_user_id
    ),
    total_submissions = (
      SELECT COUNT(*)
      FROM submissions
      WHERE submitter_user_id = NEW.submitter_user_id
    )
  WHERE id = NEW.submitter_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger
CREATE TRIGGER update_profile_stats_trigger
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();

-- Step 6: Recreate RLS policies with correct column names
-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can insert submissions (for public submission forms)
CREATE POLICY "Anyone can insert submissions"
  ON submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 2: Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (submitter_user_id = auth.uid());

-- Policy 3: Inbox owners can view all submissions to their inboxes
CREATE POLICY "Inbox owners can view submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (
    inbox_id IN (
      SELECT id FROM inboxes WHERE creator_id = auth.uid()
    )
  );

-- Policy 4: Inbox owners can delete submissions
CREATE POLICY "Inbox owners can delete submissions"
  ON submissions
  FOR DELETE
  TO authenticated
  USING (
    inbox_id IN (
      SELECT id FROM inboxes WHERE creator_id = auth.uid()
    )
  );
