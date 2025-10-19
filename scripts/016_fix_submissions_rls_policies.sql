-- Drop and recreate RLS policies for submissions table with correct column names

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON submissions;
DROP POLICY IF EXISTS "Creators can view submissions to their inboxes" ON submissions;
DROP POLICY IF EXISTS "Anyone can insert submissions" ON submissions;
DROP POLICY IF EXISTS "Creators can delete submissions to their inboxes" ON submissions;

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert submissions (for public submission forms)
CREATE POLICY "Anyone can insert submissions"
ON submissions
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Users can view their own submissions (using submitter_user_id, not user_id)
CREATE POLICY "Users can view their own submissions"
ON submissions
FOR SELECT
TO authenticated
USING (submitter_user_id = auth.uid());

-- Policy: Creators can view all submissions to their inboxes
CREATE POLICY "Creators can view submissions to their inboxes"
ON submissions
FOR SELECT
TO authenticated
USING (
  inbox_id IN (
    SELECT id FROM inboxes WHERE creator_id = auth.uid()
  )
);

-- Policy: Creators can delete submissions to their inboxes
CREATE POLICY "Creators can delete submissions to their inboxes"
ON submissions
FOR DELETE
TO authenticated
USING (
  inbox_id IN (
    SELECT id FROM inboxes WHERE creator_id = auth.uid()
  )
);
