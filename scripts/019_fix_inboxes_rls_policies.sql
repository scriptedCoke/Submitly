-- Fix RLS policies on inboxes table to use correct column name 'creator_id' instead of 'user_id'

-- Drop all existing policies on inboxes table
DROP POLICY IF EXISTS "Users can view their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Users can create their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Users can update their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Users can delete their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Enable read access for inbox owners" ON inboxes;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON inboxes;
DROP POLICY IF EXISTS "Enable update access for inbox owners" ON inboxes;
DROP POLICY IF EXISTS "Enable delete access for inbox owners" ON inboxes;

-- Recreate policies with correct column name 'creator_id'
CREATE POLICY "Users can view their own inboxes"
  ON inboxes FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can create their own inboxes"
  ON inboxes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own inboxes"
  ON inboxes FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own inboxes"
  ON inboxes FOR DELETE
  USING (auth.uid() = creator_id);
