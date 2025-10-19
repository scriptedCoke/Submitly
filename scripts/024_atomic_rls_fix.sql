-- IMPORTANT: After running this script, restart your application and clear Supabase connection pool
-- This ensures all cached policies are cleared and new policies take effect

-- Run everything in a single transaction to ensure atomicity
BEGIN;

-- Step 1: Disable RLS temporarily to avoid conflicts
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE inboxes DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies using CASCADE
DO $$ 
DECLARE
    pol record;
BEGIN
    -- Drop all policies on profiles
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles CASCADE', pol.policyname);
    END LOOP;
    
    -- Drop all policies on inboxes
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'inboxes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON inboxes CASCADE', pol.policyname);
    END LOOP;
    
    -- Drop all policies on submissions
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'submissions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON submissions CASCADE', pol.policyname);
    END LOOP;
END $$;

-- Step 3: Create new policies with correct column names

-- Profiles policies (uses 'id' column)
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Inboxes policies (uses 'creator_id' column, NOT 'user_id')
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

-- Submissions policies (uses 'submitter_user_id' column, NOT 'user_id')
CREATE POLICY "Anyone can insert submissions"
    ON submissions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can view submissions"
    ON submissions FOR SELECT
    USING (true);

CREATE POLICY "Inbox owners can view their submissions"
    ON submissions FOR SELECT
    USING (
        inbox_id IN (
            SELECT id FROM inboxes WHERE creator_id = auth.uid()
        )
    );

CREATE POLICY "Inbox owners can delete submissions"
    ON submissions FOR DELETE
    USING (
        inbox_id IN (
            SELECT id FROM inboxes WHERE creator_id = auth.uid()
        )
    );

-- Step 4: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Commit the transaction
COMMIT;

-- REMINDER: Restart your application after running this script!
