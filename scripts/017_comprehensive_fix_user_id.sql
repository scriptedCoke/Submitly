-- Comprehensive fix for all user_id references
-- This script removes all old policies, triggers, and functions
-- and recreates them with correct column names

-- Drop all existing policies on submissions table
DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON submissions;
DROP POLICY IF EXISTS "Creators can view submissions to their inboxes" ON submissions;
DROP POLICY IF EXISTS "Anyone can insert submissions" ON submissions;
DROP POLICY IF EXISTS "Authenticated users can insert submissions" ON submissions;

-- Drop all existing policies on inboxes table
DROP POLICY IF EXISTS "Anyone can view active inboxes" ON inboxes;
DROP POLICY IF EXISTS "Creators can view their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Creators can update their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Creators can delete their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Authenticated users can create inboxes" ON inboxes;

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate RLS policies for submissions with correct column names
CREATE POLICY "Anyone can insert submissions"
  ON submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Creators can view submissions to their inboxes"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (
    inbox_id IN (
      SELECT id FROM inboxes WHERE creator_id = auth.uid()
    )
  );

CREATE POLICY "Submitters can view their own submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (submitter_user_id = auth.uid());

-- Recreate RLS policies for inboxes
CREATE POLICY "Anyone can view active inboxes"
  ON inboxes
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Creators can view their own inboxes"
  ON inboxes
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can update their own inboxes"
  ON inboxes
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can delete their own inboxes"
  ON inboxes
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Authenticated users can create inboxes"
  ON inboxes
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Recreate RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
