-- Diagnostic and Fix Script for RLS Policies
-- This script will show current policies and then fix them

-- First, let's see what policies currently exist
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE '=== CURRENT RLS POLICIES ===';
    
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname, qual, with_check
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE 'Table: %, Policy: %', policy_record.tablename, policy_record.policyname;
        RAISE NOTICE '  Qual: %', policy_record.qual;
        RAISE NOTICE '  With Check: %', policy_record.with_check;
    END LOOP;
END $$;

-- Now, let's fix all policies by dropping and recreating them
-- We'll use CASCADE to ensure all dependencies are handled

-- Drop all existing policies on all tables
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I CASCADE', 
                      policy_record.policyname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- Recreate policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Recreate policies for inboxes table with correct column name: creator_id
CREATE POLICY "Users can view own inboxes"
  ON inboxes FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can create own inboxes"
  ON inboxes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own inboxes"
  ON inboxes FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own inboxes"
  ON inboxes FOR DELETE
  USING (auth.uid() = creator_id);

-- Recreate policies for submissions table with correct column name: submitter_user_id
-- Note: Submissions should be viewable by inbox owners, not just submitters
CREATE POLICY "Inbox owners can view submissions"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inboxes
      WHERE inboxes.id = submissions.inbox_id
      AND inboxes.creator_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create submissions"
  ON submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Inbox owners can delete submissions"
  ON submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM inboxes
      WHERE inboxes.id = submissions.inbox_id
      AND inboxes.creator_id = auth.uid()
    )
  );

-- Verify the new policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE '=== NEW RLS POLICIES ===';
    
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname, qual, with_check
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE 'Table: %, Policy: %', policy_record.tablename, policy_record.policyname;
        RAISE NOTICE '  Qual: %', policy_record.qual;
        RAISE NOTICE '  With Check: %', policy_record.with_check;
    END LOOP;
END $$;
