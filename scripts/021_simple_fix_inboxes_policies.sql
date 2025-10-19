-- Simple, definitive fix for inboxes RLS policies
-- Drop all existing policies and recreate with correct column name (creator_id)

-- Drop all existing policies on inboxes table
DROP POLICY IF EXISTS "Users can view their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Users can insert their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Users can update their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Users can delete their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Enable read access for own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON inboxes;
DROP POLICY IF EXISTS "Enable update for own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Enable delete for own inboxes" ON inboxes;

-- Recreate policies with correct column name: creator_id
CREATE POLICY "Users can view their own inboxes"
  ON inboxes FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can insert their own inboxes"
  ON inboxes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own inboxes"
  ON inboxes FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own inboxes"
  ON inboxes FOR DELETE
  USING (auth.uid() = creator_id);
