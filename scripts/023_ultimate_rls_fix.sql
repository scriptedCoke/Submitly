-- Ultimate fix for all user_id references in RLS policies
-- This script completely rebuilds all RLS policies with correct column names

-- First, disable RLS temporarily to allow operations
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inboxes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.submissions DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on all tables
DO $$ 
DECLARE
    pol record;
BEGIN
    -- Drop all policies on profiles
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
    
    -- Drop all policies on inboxes
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'inboxes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.inboxes', pol.policyname);
    END LOOP;
    
    -- Drop all policies on submissions
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'submissions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.submissions', pol.policyname);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create fresh policies for PROFILES table (column: id)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create fresh policies for INBOXES table (column: creator_id)
CREATE POLICY "Users can view own inboxes"
  ON public.inboxes FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can create own inboxes"
  ON public.inboxes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own inboxes"
  ON public.inboxes FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own inboxes"
  ON public.inboxes FOR DELETE
  USING (auth.uid() = creator_id);

-- Create fresh policies for SUBMISSIONS table (column: submitter_user_id)
-- Note: Submissions should be viewable by inbox creators
CREATE POLICY "Inbox creators can view submissions"
  ON public.submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inboxes
      WHERE inboxes.id = submissions.inbox_id
      AND inboxes.creator_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Inbox creators can delete submissions"
  ON public.submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.inboxes
      WHERE inboxes.id = submissions.inbox_id
      AND inboxes.creator_id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.inboxes TO authenticated;
GRANT ALL ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO anon;
