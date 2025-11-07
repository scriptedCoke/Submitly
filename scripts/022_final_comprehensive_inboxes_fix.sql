-- Final comprehensive fix for inboxes table RLS policies
-- This script drops ALL policies and recreates them with correct column names

-- First, disable RLS temporarily to ensure we can work with the table
ALTER TABLE IF EXISTS public.inboxes DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on inboxes table using dynamic SQL
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'inboxes' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.inboxes', policy_record.policyname);
    END LOOP;
END $$;

-- Drop all triggers on inboxes table
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'inboxes' AND trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.inboxes', trigger_record.trigger_name);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.inboxes ENABLE ROW LEVEL SECURITY;

-- Create new policies with correct column name (creator_id)
CREATE POLICY "Users can view their own inboxes"
ON public.inboxes
FOR SELECT
TO authenticated
USING (creator_id = auth.uid());

CREATE POLICY "Users can create their own inboxes"
ON public.inboxes
FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update their own inboxes"
ON public.inboxes
FOR UPDATE
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can delete their own inboxes"
ON public.inboxes
FOR DELETE
TO authenticated
USING (creator_id = auth.uid());

-- Allow public to view active inboxes by slug (for submission form)
CREATE POLICY "Anyone can view active inboxes by slug"
ON public.inboxes
FOR SELECT
TO anon, authenticated
USING (is_active = true);
